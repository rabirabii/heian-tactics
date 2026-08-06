import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePlannerStore } from '@/store/planner-store';
import { Input, Label, Select, FieldError } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const projectSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().min(3, "Description is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  blackDaruma: z.coerce.number().min(0),
  jade: z.coerce.number().min(0),
  souls: z.coerce.number().min(0),
  minSpd: z.coerce.number().min(0),
  soulSet: z.string().min(2, "Soul set is required"),
  expectedCompletion: z.string().min(1, "Expected date is required"),
  roiScore: z.coerce.number().min(1).max(100),
  notes: z.string().optional(),
});

type ProjectFormInput = z.input<typeof projectSchema>;
type ProjectFormValues = z.output<typeof projectSchema>;

export function NewProjectForm() {
  const addProject = usePlannerStore((state) => state.addProject);
  const form = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "High",
      blackDaruma: 0,
      jade: 0,
      souls: 0,
      minSpd: 0,
      soulSet: "Shadow",
      expectedCompletion: "2026-10-01",
      roiScore: 75,
      notes: "",
    },
  });

  return (
    <form
      className="grid gap-3 lg:grid-cols-4"
      onSubmit={form.handleSubmit((values) => {
        addProject({
          name: values.name,
          description: values.description,
          priority: values.priority,
          expectedCompletion: values.expectedCompletion,
          roiScore: values.roiScore,
          notes: values.notes ?? "",
          requirements: {
            resources: {
              blackDaruma: values.blackDaruma,
              jade: values.jade,
              souls: values.souls,
            },
            soulSet: values.soulSet,
            minSpd: values.minSpd,
          },
        });
        form.reset();
      })}
    >
      <div className="lg:col-span-2">
        <Label htmlFor="project-name">Project</Label>
        <Input id="project-name" placeholder="Finish SP Susanoo" {...form.register("name")} />
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
      <div>
        <Label htmlFor="project-date">Expected</Label>
        <Input id="project-date" type="date" {...form.register("expectedCompletion")} />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="project-description">Description</Label>
        <Input
          id="project-description"
          placeholder="Primary burst slot for Zenith drafts"
          {...form.register("description")}
        />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="project-bd">BD Required</Label>
        <Input id="project-bd" type="number" {...form.register("blackDaruma")} />
      </div>
      <div>
        <Label htmlFor="project-jade">Jade Required</Label>
        <Input id="project-jade" type="number" {...form.register("jade")} />
      </div>
      <div>
        <Label htmlFor="project-souls">Soul Pieces</Label>
        <Input id="project-souls" type="number" {...form.register("souls")} />
      </div>
      <div>
        <Label htmlFor="project-spd">SPD Target</Label>
        <Input id="project-spd" type="number" {...form.register("minSpd")} />
      </div>
      <div>
        <Label htmlFor="project-soul-set">Soul Set</Label>
        <Input id="project-soul-set" {...form.register("soulSet")} />
        <FieldError>{form.formState.errors.soulSet?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="project-roi">ROI Score</Label>
        <Input id="project-roi" type="number" min="1" max="100" {...form.register("roiScore")} />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="project-notes">Notes</Label>
        <Input id="project-notes" {...form.register("notes")} />
      </div>
      <Button className="lg:col-span-4" type="submit">
        Add Project
      </Button>
    </form>
  );
}