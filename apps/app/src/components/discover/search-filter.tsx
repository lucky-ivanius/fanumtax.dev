"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2Icon, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@fanumtax/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@fanumtax/ui/components/form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@fanumtax/ui/components/input-group";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@fanumtax/ui/components/multi-select";
import { cn } from "@fanumtax/utils/class-name";

import { LANGUAGE_OPTIONS, LICENSE_OPTIONS } from "@/config/consts";

const searchFilterFormSchema = z.object({
  q: z.string().optional(),
  lang: z.array(z.string()).optional(),
  license: z.array(z.string()).optional(),
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
      lang: values.lang ?? [],
      license: values.license ?? [],
    },
  });

  const onSubmit = ({ q, lang, license }: SearchFilterFormData) => {
    const searchParams = new URLSearchParams();

    if (q) searchParams.set("q", q);
    if (lang?.length) searchParams.set("lang", lang.join(","));
    if (license?.length) searchParams.set("license", license.join(","));

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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("flex flex-col gap-6 bg-card p-6 shadow", !open && "hidden", "md:flex")}
        >
          <FormField
            control={form.control}
            disabled={isLoading}
            name="q"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup className="h-12 bg-input">
                    <InputGroupInput type="search" placeholder="Search repositories..." {...field} />
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-4">
            <FormField
              control={form.control}
              disabled={isLoading}
              name="lang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages</FormLabel>
                  <FormControl>
                    <MultiSelect {...field}>
                      <MultiSelectTrigger className="w-full">
                        <MultiSelectValue
                          formatSelected={(selectedValues) => `${selectedValues.size} languages selected`}
                          placeholder="Select languages..."
                        />
                      </MultiSelectTrigger>
                      <MultiSelectContent
                        search={{
                          emptyMessage: "No languages found",
                        }}
                      >
                        {LANGUAGE_OPTIONS.map(({ value, label }) => (
                          <MultiSelectItem key={value} value={value}>
                            {label}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectContent>
                    </MultiSelect>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              disabled={isLoading}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Licenses</FormLabel>
                  <FormControl>
                    <MultiSelect {...field}>
                      <MultiSelectTrigger className="w-full">
                        <MultiSelectValue
                          formatSelected={(selectedValues) => `${selectedValues.size} licenses selected`}
                          placeholder="Select licenses..."
                        />
                      </MultiSelectTrigger>
                      <MultiSelectContent
                        search={{
                          emptyMessage: "No licenses found",
                        }}
                      >
                        {LICENSE_OPTIONS.map(({ value, label }) => (
                          <MultiSelectItem key={value} value={value}>
                            {label}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectContent>
                    </MultiSelect>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Button type="submit" disabled={isLoading} className="w-full md:w-min">
              {isLoading ? (
                <>
                  <span className="flex items-center gap-2 md:hidden">
                    <Loader2Icon className="animate-spin" /> Searching...
                  </span>
                  <span className="hidden items-center gap-2 md:inline-flex">Apply</span>
                </>
              ) : (
                <span>Apply</span>
              )}
            </Button>
            {isLoading && (
              <span className="hidden items-center text-muted-foreground text-sm md:inline-flex">Searching...</span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
