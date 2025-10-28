"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pollsApi } from "@/lib/api";
import { getUserId } from "@/lib/utils";
import { Plus, X, Sparkles } from "lucide-react";

const CATEGORIES = [
  "General",
  "Technology",
  "Sports",
  "Entertainment",
  "Politics",
  "Business",
  "Science",
  "Lifestyle",
];

export function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a poll title");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    try {
      setIsSubmitting(true);

      const poll = await pollsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category,
        options: validOptions.map((opt, index) => ({
          option_text: opt.trim(),
          position: index,
        })),
      });

      router.push(`/poll/${poll.id}`);
    } catch (error: any) {
      console.error("Error creating poll:", error);
      if (error.response?.status === 401) {
        alert("Please login to create a poll");
      } else {
        alert("Failed to create poll. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-[#34CC41]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#E6E6E6]">
            Create a Poll
          </h1>
          <p className="text-base text-[#A4A4A4]">
            Ask a question and gather opinions in real-time
          </p>
        </div>

        <Card className="border-[#323232] border-[1.5px] shadow-lg shadow-black/20 bg-[#1C1C1C]">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#E6E6E6]">
                  Poll Question
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What would you like to ask?"
                  maxLength={500}
                  required
                  className="h-12 text-base bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#E6E6E6]">
                  Description{" "}
                  <span className="text-[#A4A4A4] font-normal">(optional)</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context or details..."
                  rows={3}
                  className="resize-none bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#E6E6E6]">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] focus:border-white focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#323232] border-[1.5px]">
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-[#E6E6E6] focus:bg-[#323232] focus:text-[#E6E6E6]"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#E6E6E6]">
                  Answer Options
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#34CC41]/10 border border-[#34CC41] text-[#34CC41] text-sm font-medium shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        maxLength={500}
                        required
                        className="flex-1 bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="shrink-0 text-[#A4A4A4] hover:text-red-500 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full border-dashed border-2 border-[#323232] hover:border-[#34CC41] hover:bg-[#34CC41]/10 text-[#A4A4A4] hover:text-[#34CC41] bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Option
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base bg-[#34CC41] text-black hover:bg-[#2eb838] transition-all font-semibold"
              >
                {isSubmitting ? "Creating Your Poll..." : "Create Poll"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
