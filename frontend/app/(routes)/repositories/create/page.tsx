"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Book, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  reponame: z.string().min(1, "Name is required.").max(100),
  description: z.string().max(200).optional(),
  visibility: z.enum(["public", "private"], {
    error: "You need to select a visibility.",
  }),
  addReadme: z.boolean().default(false).optional(),
  gitignore: z.string().optional(),
  license: z.string().optional(),
});

const generateRepoName = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_.-]/g, "");
};

export default function CreatePage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reponame: "",
      description: "",
      visibility: "public",
      addReadme: false,
    },
  });

  const { isSubmitting } = form.formState;
  const reponameValue = form.watch("reponame");
  const finalRepoName = generateRepoName(reponameValue);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      reponame: generateRepoName(values.reponame),
    };

    if (!payload.reponame) {
      toast.error("Repository name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("/api/repositories/create", payload);
      const newRepo = response.data;

      toast.success("Repository created successfully!");

      if (newRepo && newRepo.user && newRepo.user.username && newRepo.name) {
        window.location.href = `/${newRepo.user.username}/${newRepo.name}/`;
      } else {
        console.error("Received unexpected data from server", newRepo);
        toast.error("Could not redirect. Please refresh.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";
      toast.error(errorMessage);
      console.error(error);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create a new repository
          </h1>
          <p className="text-gray-600 mt-2">
            A repository contains all project files, including the revision
            history.
          </p>
        </div>

        <Card className="bg-white">
          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="reponame"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Repository Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-base p-4"
                          placeholder="Project-Eris"
                          {...field}
                        />
                      </FormControl>

                      {reponameValue && (
                        <FormDescription className="pt-2">
                          Your new repository will be created as{" "}
                          <span className="font-semibold text-green-600">
                            your-username/{finalRepoName}
                          </span>
                          .
                        </FormDescription>
                      )}

                      {reponameValue && (
                        <FormDescription>
                          The repository name can only contain ASCII letters,
                          digits, and the characters ., -, and _.
                        </FormDescription>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Description{" "}
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about this repository"
                          className="resize-none text-base p-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">
                        Visibility
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                            <Book className="h-5 w-5 text-gray-600" />
                            <div className="flex flex-col">
                              <FormLabel className="font-semibold text-gray-800 flex items-center">
                                <FormControl>
                                  <RadioGroupItem
                                    value="public"
                                    className="mr-3"
                                  />
                                </FormControl>
                                Public
                              </FormLabel>
                              <FormDescription className="ml-7 text-sm">
                                Anyone on the internet can see this repository.
                                You choose who can commit.
                              </FormDescription>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                            <Lock className="h-5 w-5 text-gray-600" />
                            <div className="flex flex-col">
                              <FormLabel className="font-semibold text-gray-800 flex items-center">
                                <FormControl>
                                  <RadioGroupItem
                                    value="private"
                                    className="mr-3"
                                  />
                                </FormControl>
                                Private
                              </FormLabel>
                              <FormDescription className="ml-7 text-sm">
                                You choose who can see and commit to this
                                repository.
                              </FormDescription>
                            </div>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Initialize repository with:
                  </h3>
                  <FormField
                    control={form.control}
                    name="addReadme"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Add a README file</FormLabel>
                          <FormDescription>
                            This is where you can write a long description for
                            your project.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gitignore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add .gitignore</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a .gitignore template..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="node">Node</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="nextjs">Next.js</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a template to ignore common files from being
                          tracked.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <Button
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Creating..." : "Create Repository"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
