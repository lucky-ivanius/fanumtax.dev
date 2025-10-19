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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fanumtax/ui/components/select";
import { cn } from "@fanumtax/utils/class-name";

import { LANG_OPTIONS, SORT_OPTIONS } from "@/config/consts";

const searchFilterFormSchema = z.object({
  q: z.string().optional(),
  lang: z.array(z.string()).optional(),
  sort: z.string().optional(),
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
      sort: values.sort ?? "",
    },
  });

  const onSubmit = ({ q, lang, sort }: SearchFilterFormData) => {
    const searchParams = new URLSearchParams();

    if (q) searchParams.set("q", q);
    if (lang?.length) searchParams.set("lang", lang.join(","));
    if (sort) searchParams.set("sort", sort);

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
              name="lang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
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
                        {LANG_OPTIONS.map(({ value, label }) => (
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
              name="sort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort by</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-4 md:flex-row-reverse md:justify-end">
            {/* <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={() => {
                form.reset({
                  q: "",
                  lang: [],
                  sort: "",
                });

                form.handleSubmit(onSubmit)();
              }}
            >
              Clear
            </Button> */}

            <Button type="submit" disabled={isLoading} className="flex-1 md:flex-none">
              {isLoading && <Loader2Icon className="animate-spin" />}
              {isLoading ? "Searching" : "Apply"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
