// TaskAllocator.ts

type Task = {
  TaskID: string;
  Duration: number;
  RequiredSkills?: string[];
};

type Worker = {
  WorkerID: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
};

type Rule =
  | { type: "coRun"; tasks: string[] }
  | { type: "slotRestriction"; group: string; minSlots: number }
  | { type: "loadLimit"; group: string; maxSlots: number };

type Prioritization = {
  priorityWeight: number;
  fairnessWeight: number;
  fulfillmentWeight: number;
};

type AllocationResult = {
  task: string;
  worker: string;
  score: number;
};

export function allocateTasks(
  tasks: Task[],
  workers: Worker[],
  rules: Rule[],
  prioritization: Prioritization
): AllocationResult[] {
  const allocations: AllocationResult[] = [];

  tasks.forEach((task) => {
    const possibleWorkers = workers.filter((w) =>
      task.RequiredSkills?.every((skill) => w.Skills.includes(skill))
    );

    const scored = possibleWorkers.map((worker) => {
      const fulfillment = 10; // mocked fulfillment score
      const fairness = 10 - worker.AvailableSlots.length;
      const priority = task.Duration; // mock duration = priority

      const score =
        fulfillment * prioritization.fulfillmentWeight +
        fairness * prioritization.fairnessWeight +
        priority * prioritization.priorityWeight;

      return {
        task: task.TaskID,
        worker: worker.WorkerID,
        score,
      };
    });

    // Pick highest scoring worker
    if (scored.length > 0) {
      const best = scored.sort((a, b) => b.score - a.score)[0];
      allocations.push(best);
    }
  });

  return allocations;
}
