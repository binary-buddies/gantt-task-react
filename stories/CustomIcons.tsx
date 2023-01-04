import React, {
  useCallback,
  useState,
} from "react";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  Gantt,
  Icons,
  OnChangeTasks,
  Task,
  TaskOrEmpty,
} from "../src";

import {
  initTasks,
  onAddTask,
  onEditTask,
} from "./helper";

import "../dist/index.css";

const icons: Icons = {
  renderAddIcon: () => <>➕</>,
  renderClosedIcon: () => <>📁</>,
  renderDeleteIcon: () => <>➖</>,
  renderEditIcon: () => <>🗃</>,
  renderNoChildrenIcon: () => <>🥳</>,
  renderOpenedIcon: () => <>📂</>,
};

type AppProps = {
  ganttHeight?: number;
};

export const CustomIcons: React.FC<AppProps> = (props) => {
  const [tasks, setTasks] = useState<readonly TaskOrEmpty[]>(initTasks());

  const onChangeTasks = useCallback<OnChangeTasks>((nextTasks, action) => {
    switch (action.type) {
      case "delete_relation":
        if (window.confirm(`Do yo want to remove relation between ${action.payload.taskFrom.name} and ${action.payload.taskTo.name}?`)) {
          setTasks(nextTasks);
        }
        break;

      case "delete_task":
        if (window.confirm(`Are you sure about ${action.payload.task.name}?`)) {
          setTasks(nextTasks);
        }
        break;

      default:
        setTasks(nextTasks);
        break;
    }
  }, []);

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Gantt
        {...props}
        expandIconWidth={30}
        icons={icons}
        onAddTask={onAddTask}
        onChangeTasks={onChangeTasks}
        onDoubleClick={handleDblClick}
        onEditTask={onEditTask}
        onClick={handleClick}
        tasks={tasks}
      />
    </DndProvider>
  );
};
