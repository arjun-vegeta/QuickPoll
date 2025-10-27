'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { pollsApi } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    setOptions([...options, '']);
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
      alert('Please enter a poll title');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    try {
      setIsSubmitting(true);

      const poll = await pollsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions.map((opt, index) => ({
          option_text: opt.trim(),
          position: index,
        })),
      });

      router.push(`/poll/${poll.id}`);
    } catch (error: any) {
      console.error('Error creating poll:', error);
      if (error.response?.status === 401) {
        alert('Please login to create a poll');
      } else {
        alert('Failed to create poll. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Create a Poll
        </h1>
        <p className="text-slate-600">
          Ask a question and gather opinions in real-time
        </p>
      </div>

      <Card className="border-slate-200 shadow-xl bg-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 pointer-events-none rounded-lg" />
        
        <CardContent className="relative pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Poll Question</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What would you like to ask?"
                maxLength={500}
                required
                className="h-12 text-base border-slate-200 focus:border-blue-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Description <span className="text-slate-500 font-normal">(optional)</span></label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context or details..."
                className="h-11 border-slate-200 focus:border-blue-300"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">Answer Options</label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-medium shrink-0">
                      {index + 1}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={500}
                      required
                      className="flex-1 border-slate-200 focus:border-blue-300"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
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
                className="w-full border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Option
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
            >
              {isSubmitting ? 'Creating Your Poll...' : 'Create Poll'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
