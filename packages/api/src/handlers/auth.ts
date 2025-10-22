import type { Address, Hex } from "viem";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { createPublicClient, http, isAddress, isHex } from "viem";
import { generateSiweNonce, parseSiweMessage } from "viem/siwe";
import z from "zod";

import type { Env } from "../env";
import * as tables from "../lib/db/schema";
import { badRequest, created, ok, unauthorized } from "../utils/response";
import { sign } from "../utils/token";
import { schema } from "../utils/validation";

const authHandlers = new Hono<Env>();

authHandlers
  .get(
    "/siwe/:address/nonce",
    validator(
      "param",
      schema(
        z.object({
          address: z
            .string({
              error: ({ input }) => (input ? "Address must be a string" : "Address is required"),
            })
            .refine(isAddress, "Invalid EVM Address"),
        })
      )
    ),
    async (c) => {
      const { address } = c.req.valid("param");

      const nonce = generateSiweNonce();

      const kv = c.env.KV;

      await kv.put(`siwe:nonce:${address.toLowerCase()}`, nonce, { expirationTtl: 60 * 10 }); // 10 minutes

      return created(c, {
        nonce,
      });
    }
  )
  .post(
    "/siwe",
    validator(
      "json",
      schema(
        z.object({
          address: z
            .string({
              error: ({ input }) => (input ? "Address must be a string" : "Address is required"),
            })
            .refine(isAddress, "Invalid EVM Address"),
          message: z.string({
            error: ({ input }) => (input ? "Message must be a string" : "Message is required"),
          }),
          signature: z
            .string({
              error: ({ input }) => (input ? "Signature must be a string" : "Signature is required"),
            })
            .refine(isHex, "Invalid signature"),
        })
      )
    ),
    async (c) => {
      const { address, message, signature } = c.req.valid("json");

      const { nonce } = parseSiweMessage(message);
      if (!nonce) return badRequest(c, { error: "invalid_message", message: "Invalid message" });

      const kv = c.env.KV;
      const validNonce = await kv.get(`siwe:nonce:${address.toLowerCase()}`);
      if (!validNonce) return badRequest(c, { error: "invalid_message", message: "Invalid message" });

      if (nonce !== validNonce) return badRequest(c, { error: "invalid_message", message: "Invalid message" });

      const publicClient = createPublicClient({
        transport: http(c.env.HTTP_RPC_URL),
      });
      const isValid = await publicClient.verifyMessage({
        address: address as Address,
        message,
        signature: signature as Hex,
      });
      if (!isValid) return unauthorized(c, { error: "invalid_signature", message: "Invalid signature" });

      const db = drizzle(c.env.D1);
      const [user] = await db
        .select()
        .from(tables.users)
        .where(eq(tables.users.formattedAddress, address.toLowerCase()));
      if (!user) {
        const [createdUser] = await db
          .insert(tables.users)
          .values({
            address,
            formattedAddress: address.toLowerCase(),
          })
          .returning();

        await kv.delete(`siwe:nonce:${address.toLowerCase()}`);

        const token = await sign(
          {
            sub: createdUser.id,
            address,
          },
          c.env.JWT_SECRET
        );
        if (!token) return unauthorized(c, { error: "failed_to_generate_token", message: "Failed to generate token" });

        return ok(c, {
          token,
        });
      }

      await kv.delete(`siwe:nonce:${address.toLowerCase()}`);

      const token = await sign(
        {
          sub: user.id,
          address,
        },
        c.env.JWT_SECRET
      );
      if (!token) return unauthorized(c, { error: "failed_to_generate_token", message: "Failed to generate token" });

      return ok(c, {
        token,
      });
    }
  );

export { authHandlers };
