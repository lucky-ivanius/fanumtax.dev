"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2Icon, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@fanumtax/ui/components/button";
import { Form, FormControl, FormField, FormItem } from "@fanumtax/ui/components/form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@fanumtax/ui/components/input-group";
import { cn } from "@fanumtax/utils/class-name";

const searchFilterFormSchema = z.object({
  q: z.string().optional(),
});

type SearchFilterFormData = z.infer<typeof searchFilterFormSchema>;

interface SearchFilterProps {
  defaultOpen?: boolean;
  values: SearchFilterFormData;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ defaultOpen = false, values }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  const [open, setOpen] = useState(defaultOpen);

  const form = useForm<SearchFilterFormData>({
    resolver: zodResolver(searchFilterFormSchema),
    values: {
      q: values.q ?? "",
    },
  });

  const onSubmit = ({ q }: SearchFilterFormData) => {
    const searchParams = new URLSearchParams();

    if (q) searchParams.set("q", q);

    startTransition(() => {
      router.push(`${pathname}?${searchParams.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        className="flex items-center justify-between gap-4 border border-border bg-background md:hidden"
        onClick={() => setOpen(!open)}
      >
        Filters
        <ChevronDown className={cn("transform transition-transform", open && "rotate-180")} />
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col", !open && "hidden", "md:flex")}>
          <FormField
            control={form.control}
            disabled={isLoading}
            name="q"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup className="h-12 bg-input">
                    <InputGroupInput type="search" placeholder="Search issues..." {...field} />
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
