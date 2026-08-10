"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjectStore } from '@/store/project-store';
import { Input, Label, Select, FieldError } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

// Helper to convert comma-separated string to number array
const parseSkills = (val: string) => {
  return val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
};

const projectSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().min(3, "Description is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  currentGrade: z.coerce.number().min(2).max(6),
  targetGrade: z.coerce.number().min(2).max(6),
  currentSkills: z.string().regex(/^\d+(,\s*\d+)*$/, "Must be comma separated numbers (e.g. 1, 1, 1)"),
  targetSkills: z.string().regex(/^\d+(,\s*\d+)*$/, "Must be comma separated numbers (e.g. 5, 5, 5)"),
}).refine((data) => data.targetGrade >= data.currentGrade, {
  message: "Target grade must be >= current grade",
  path: ["targetGrade"],
}).refine((data) => {
  const current = parseSkills(data.currentSkills);
  const target = parseSkills(data.targetSkills);
  if (current.length !== target.length) return false;
  return target.every((t, i) => t >= current[i]);
}, {
  message: "Target skills must be >= current skills and have same length",
  path: ["targetSkills"],
});

type ProjectFormInput = z.input<typeof projectSchema>;
type ProjectFormValues = z.output<typeof projectSchema>;

export function NewProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const addProject = useProjectStore((state) => state.addProject);
  const form = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "High",
      currentGrade: 2,
      targetGrade: 6,
      currentSkills: "1, 1, 1",
      targetSkills: "5, 5, 5",
    },
  });

  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={form.handleSubmit((values) => {
        const currentSkills = parseSkills(values.currentSkills);
        const targetSkills = parseSkills(values.targetSkills);

        addProject({
          id: `project-${Date.now()}`,
          name: values.name,
          description: values.description,
          priority: values.priority,
          unitProgression: {
            unitId: `unit-${Date.now()}`,
            name: values.name, // Using project name as unit name for simplicity
            gradeProgress: {
              currentGrade: values.currentGrade as any,
              targetGrade: values.targetGrade as any,
            },
            skillProgress: {
              currentSkills,
              targetSkills,
            },
          }
        });
        form.reset();
        onSuccess?.();
      })}
    >
      <div className="sm:col-span-2 lg:col-span-2">
        <Label htmlFor="project-name">Unit Name</Label>
        <Input id="project-name" placeholder="e.g., SP Susanoo" {...form.register("name")} />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="project-priority">Priority</Label>
        <Select id="project-priority" {...form.register("priority")}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Label htmlFor="project-description">Description</Label>
        <Input
          id="project-description"
          placeholder="e.g., Primary burst slot for Zenith draft flexibility"
          {...form.register("description")}
        />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </div>
      
      {/* Grade Progression */}
      <div>
        <Label htmlFor="current-grade">Current Grade (2-6)</Label>
        <Input id="current-grade" type="number" min="2" max="6" {...form.register("currentGrade")} />
      </div>
      <div>
        <Label htmlFor="target-grade">Target Grade (2-6)</Label>
        <Input id="target-grade" type="number" min="2" max="6" {...form.register("targetGrade")} />
        <FieldError>{form.formState.errors.targetGrade?.message}</FieldError>
      </div>

      {/* Skill Progression */}
      <div className="sm:col-span-1 lg:col-span-1">
        <Label htmlFor="current-skills">Current Skills</Label>
        <Input id="current-skills" placeholder="1, 1, 1" {...form.register("currentSkills")} />
        <FieldError>{form.formState.errors.currentSkills?.message}</FieldError>
      </div>
      <div className="sm:col-span-1 lg:col-span-1">
        <Label htmlFor="target-skills">Target Skills</Label>
        <Input id="target-skills" placeholder="5, 5, 5" {...form.register("targetSkills")} />
        <FieldError>{form.formState.errors.targetSkills?.message}</FieldError>
      </div>

      <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
        <Button className="w-full sm:w-auto font-bold px-6" type="submit">
          Save Project
        </Button>
      </div>
    </form>
  );
}