"use client";
import React, { useState } from "react";

type Rule =
  | { type: "coRun"; tasks: string[] }
  | { type: "slotRestriction"; group: string; minSlots: number }
  | { type: "loadLimit"; group: string; maxSlots: number };

const RuleBuilder: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [group, setGroup] = useState("");
  const [minSlots, setMinSlots] = useState("");
  const [maxSlots, setMaxSlots] = useState("");
  const [nlInput, setNlInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    { message: string; rule: Rule }[]
  >([]);
  const [prioritization, setPrioritization] = useState({
    priorityWeight: 5,
    fairnessWeight: 5,
    fulfillmentWeight: 5,
  });

  const addCoRun = () => {
    const tasks = taskInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (tasks.length >= 2) {
      setRules([...rules, { type: "coRun", tasks }]);
      setTaskInput("");
    }
  };

  const addSlotRestriction = () => {
    if (group && minSlots) {
      setRules([
        ...rules,
        { type: "slotRestriction", group, minSlots: parseInt(minSlots) },
      ]);
      setGroup("");
      setMinSlots("");
    }
  };

  const addLoadLimit = () => {
    if (group && maxSlots) {
      setRules([
        ...rules,
        { type: "loadLimit", group, maxSlots: parseInt(maxSlots) },
      ]);
      setGroup("");
      setMaxSlots("");
    }
  };

  const handleNaturalRule = () => {
    const input = nlInput.toLowerCase();

    if (input.includes("co-run") || input.includes("co run")) {
      const matches = input.match(/t\d+/g);
      if (matches && matches.length >= 2) {
        setRules([...rules, { type: "coRun", tasks: matches }]);
      }
    } else if (input.includes("restrict") && input.includes("min")) {
      const groupMatch = input.match(/group\s(\w+)/);
      const slotMatch = input.match(/min(?:imum)?\s(\d+)/);
      if (groupMatch && slotMatch) {
        setRules([
          ...rules,
          {
            type: "slotRestriction",
            group: groupMatch[1],
            minSlots: parseInt(slotMatch[1]),
          },
        ]);
      }
    } else if (input.includes("limit") && input.includes("slots")) {
      const groupMatch = input.match(/group\s(\w+)/);
      const slotMatch = input.match(/(?:to|limit)\s(\d+)/);
      if (groupMatch && slotMatch) {
        setRules([
          ...rules,
          {
            type: "loadLimit",
            group: groupMatch[1],
            maxSlots: parseInt(slotMatch[1]),
          },
        ]);
      }
    }

    setNlInput("");
  };

  const fetchAISuggestions = () => {
    const mockSuggestions = [
      {
        message: "Tasks T1 and T2 always co-occur. Suggest Co-Run.",
        rule: { type: "coRun", tasks: ["T1", "T2"] } as Rule,
      },
      {
        message: "Group Sales is overloaded. Suggest Load Limit of 3.",
        rule: { type: "loadLimit", group: "Sales", maxSlots: 3 } as Rule,
      },
    ];
    setSuggestions(mockSuggestions);
  };

  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const exportRules = () => {
    const output = {
      rules,
      prioritization,
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rules.json";
    link.click();
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>📏 Rule Configurator</h2>

      <div style={{ marginBottom: 16 }}>
        <strong>Co-Run Rule</strong> (comma-separated Task IDs):<br />
        <input
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button onClick={addCoRun}>Add Co-Run</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Slot Restriction</strong>
        <br />
        Group:{" "}
        <input value={group} onChange={(e) => setGroup(e.target.value)} />
        Min Slots:{" "}
        <input
          type="number"
          value={minSlots}
          onChange={(e) => setMinSlots(e.target.value)}
        />
        <button onClick={addSlotRestriction}>Add Slot Restriction</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Load Limit</strong>
        <br />
        Group:{" "}
        <input value={group} onChange={(e) => setGroup(e.target.value)} />
        Max Slots/Phase:{" "}
        <input
          type="number"
          value={maxSlots}
          onChange={(e) => setMaxSlots(e.target.value)}
        />
        <button onClick={addLoadLimit}>Add Load Limit</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Natural Language Rule:</strong>
        <br />
        <input
          value={nlInput}
          onChange={(e) => setNlInput(e.target.value)}
          placeholder="e.g. Co-run T1, T2 or Limit group Sales to 3 slots"
          style={{ width: "60%" }}
        />
        <button onClick={handleNaturalRule}>🧠 Add Smart Rule</button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>🧠 AI Rule Suggestions</h3>
        <button onClick={fetchAISuggestions}>Get AI Suggestions</button>
        <ul>
          {suggestions.map((sug, idx) => (
            <li key={idx} style={{ margin: "12px 0" }}>
              {sug.message}{" "}
              <button
                onClick={() => {
                  setRules([...rules, sug.rule]);
                  setSuggestions(suggestions.filter((_, i) => i !== idx));
                }}
              >✅ Add</button>{" "}
              <button
                onClick={() =>
                  setSuggestions(suggestions.filter((_, i) => i !== idx))
                }
              >❌ Dismiss</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>🎛️ Prioritization Weights</h3>
        Priority Level Weight:{" "}
        <input
          type="range"
          min="1"
          max="10"
          value={prioritization.priorityWeight}
          onChange={(e) =>
            setPrioritization({
              ...prioritization,
              priorityWeight: parseInt(e.target.value),
            })
          }
        />
        {prioritization.priorityWeight}
        <br />
        Fairness Weight:{" "}
        <input
          type="range"
          min="1"
          max="10"
          value={prioritization.fairnessWeight}
          onChange={(e) =>
            setPrioritization({
              ...prioritization,
              fairnessWeight: parseInt(e.target.value),
            })
          }
        />
        {prioritization.fairnessWeight}
        <br />
        Task Fulfillment Weight:{" "}
        <input
          type="range"
          min="1"
          max="10"
          value={prioritization.fulfillmentWeight}
          onChange={(e) =>
            setPrioritization({
              ...prioritization,
              fulfillmentWeight: parseInt(e.target.value),
            })
          }
        />
        {prioritization.fulfillmentWeight}
      </div>

      <div style={{ marginBottom: 24 }}>
        <strong>Preset Profiles:</strong>
        <br />
        <button
          onClick={() =>
            setPrioritization({
              priorityWeight: 3,
              fairnessWeight: 2,
              fulfillmentWeight: 10,
            })
          }
        >🌟 Maximize Fulfillment</button>{" "}
        <button
          onClick={() =>
            setPrioritization({
              priorityWeight: 4,
              fairnessWeight: 10,
              fulfillmentWeight: 5,
            })
          }
        >⚖️ Fair Distribution</button>{" "}
        <button
          onClick={() =>
            setPrioritization({
              priorityWeight: 10,
              fairnessWeight: 1,
              fulfillmentWeight: 3,
            })
          }
        >⚡ Fastest Delivery</button>
      </div>

      <h3>📄 Rules</h3>
      <ul>
        {rules.map((rule, index) => (
          <li key={index}>
            {JSON.stringify(rule)}{" "}
            <button onClick={() => removeRule(index)}>❌ Remove</button>
          </li>
        ))}
      </ul>

      <button onClick={exportRules} style={{ marginTop: 16 }}>📤 Export rules.json</button>
    </div>
  );
};

export default RuleBuilder;
