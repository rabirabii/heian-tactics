import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePlannerStore } from '@/store/planner-store';
import { resourceLabels, resourceOrder } from '@/lib/planner-data';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select } from '@/components/ui/form';

const resourceAdjustmentSchema = z.object({
  type: z.enum([
    "blackDaruma",
    "blackDarumaShards",
    "jade",
    "ap",
    "coins",
    "realmRaidTickets",
    "exp",
    "souls",
    "eventCurrency",
  ]),
  change: z.coerce.number().finite(),
  note: z.string().min(2, "Add a short note"),
});

type ResourceAdjustmentInput = z.input<typeof resourceAdjustmentSchema>;
type ResourceAdjustmentValues = z.output<typeof resourceAdjustmentSchema>;

export function ResourceAdjustmentForm() {
  const adjustResource = usePlannerStore((state) => state.adjustResource);
  const form = useForm<ResourceAdjustmentInput, unknown, ResourceAdjustmentValues>({
    resolver: zodResolver(resourceAdjustmentSchema),
    defaultValues: {
      type: "blackDaruma",
      change: 1,
      note: "Manual adjustment",
    },
  });

  return (
    <form
      className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1.7fr_auto]"
      onSubmit={form.handleSubmit((values) => {
        adjustResource(values.type, values.change, values.note);
        form.reset({ ...values, change: 0 });
      })}
    >
      <div>
        <Label htmlFor="resource-type">Resource</Label>
        <Select id="resource-type" {...form.register("type")}>
          {resourceOrder.map((type) => (
            <option key={type} value={type}>
              {resourceLabels[type]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="resource-change">Adjustment</Label>
        <Input id="resource-change" type="number" step="1" {...form.register("change")} />
        <FieldError>{form.formState.errors.change?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="resource-note">Note</Label>
        <Input id="resource-note" {...form.register("note")} />
        <FieldError>{form.formState.errors.note?.message}</FieldError>
      </div>
      <Button className="self-end" type="submit">
        Apply
      </Button>
    </form>
  );
}