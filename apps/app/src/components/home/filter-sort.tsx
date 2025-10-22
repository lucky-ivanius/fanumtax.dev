"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@fanumtax/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@fanumtax/ui/components/form";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@fanumtax/ui/components/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fanumtax/ui/components/select";

import { LANGUAGE_OPTIONS, LICENSE_OPTIONS, REPO_SORT_OPTIONS } from "@/config/consts";

const filterSortFormSchema = z.object({
  lang: z.array(z.string()).optional(),
  license: z.array(z.string()).optional(),
  sort: z.string().optional(),
});

type FilterSortFormData = z.infer<typeof filterSortFormSchema>;

interface FilterSortProps {
  values: FilterSortFormData;
}

export const FilterSort: React.FC<FilterSortProps> = ({ values }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  const form = useForm<FilterSortFormData>({
    resolver: zodResolver(filterSortFormSchema),
    values: {
      lang: values.lang ?? [],
      license: values.license ?? [],
      sort: values.sort ?? "highest_bounty",
    },
  });

  const onSubmit = ({ lang, license, sort }: FilterSortFormData) => {
    const searchParams = new URLSearchParams();

    if (lang?.length) searchParams.set("lang", lang.join(","));
    if (license?.length) searchParams.set("license", license.join(","));
    if (sort) searchParams.set("sort", sort);

    startTransition(() => {
      router.push(`${pathname}?${searchParams.toString()}`);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-4">
          <FormField
            control={form.control}
            disabled={isLoading}
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
                    <MultiSelectTrigger className="w-full" disabled>
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
          <FormField
            control={form.control}
            disabled={isLoading}
            name="sort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort by</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REPO_SORT_OPTIONS.map(({ value, label }) => (
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
          <Button type="submit" disabled={isLoading} className="w-full self-end md:w-min">
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
        </div>
      </form>
    </Form>
  );
};
