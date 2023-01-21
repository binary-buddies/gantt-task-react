import React, {
  memo,
  useEffect,
} from "react";
import type {
  ComponentType,
  RefObject,
} from "react";

import cx from 'classnames';

import { useDrop } from "react-dnd";

import {
  ChildMapByLevel,
  Column,
  ColumnResizeEvent,
  DateSetup,
  Distances,
  Icons,
  MapTaskToNestedIndex,
  Task,
  TaskListHeaderProps,
  TaskListTableProps,
  TaskOrEmpty,
} from "../../types/public-types";

import styles from './task-list.module.css';
import { ROW_DRAG_TYPE } from "../../constants";
import { useOptimizedList } from "../../helpers/use-optimized-list";

const SCROLL_DELAY = 25;

export type TaskListProps = {
  canMoveTasks: boolean;
  canResizeColumns: boolean;
  childTasksMap: ChildMapByLevel;
  closedTasks: Readonly<Record<string, true>>;
  columns: readonly Column[];
  columnResizeEvent: ColumnResizeEvent | null;
  dateSetup: DateSetup;
  distances: Distances;
  fontFamily: string;
  fontSize: string;
  fullRowHeight: number;
  ganttFullHeight: number;
  handleAddTask: (task: Task) => void;
  handleDeteleTask: (task: TaskOrEmpty) => void;
  handleEditTask: (task: TaskOrEmpty) => void;
  handleMoveTaskAfter: (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => void;
  handleMoveTaskInside: (parent: Task, child: TaskOrEmpty) => void;
  horizontalContainerClass?: string;
  icons?: Partial<Icons>;
  isShowTaskNumbers: boolean;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  onExpanderClick: (task: Task) => void;
  onResizeStart: (columnIndex: number, event: React.MouseEvent) => void;
  scrollToBottomStep: () => void;
  scrollToTask: (task: Task) => void;
  scrollToTopStep: () => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task) => void;
  taskListContainerRef: RefObject<HTMLDivElement>;
  taskListRef: RefObject<HTMLDivElement>;
  taskListWidth: number;
  tasks: readonly TaskOrEmpty[];
  TaskListHeader: ComponentType<TaskListHeaderProps>;
  TaskListTable: ComponentType<TaskListTableProps>;
};

const TaskListInner: React.FC<TaskListProps> = ({
  canMoveTasks,
  canResizeColumns,
  childTasksMap,
  closedTasks,
  columnResizeEvent,
  columns,
  dateSetup,
  distances,
  fontFamily,
  fontSize,
  fullRowHeight,
  ganttFullHeight,
  handleAddTask,
  handleDeteleTask,
  handleEditTask,
  handleMoveTaskAfter,
  handleMoveTaskInside,
  horizontalContainerClass,
  icons = undefined,
  isShowTaskNumbers,
  mapTaskToNestedIndex,
  onExpanderClick,
  onResizeStart,
  scrollToBottomStep,
  scrollToTask,
  scrollToTopStep,
  selectedTask,
  setSelectedTask,
  taskListContainerRef,
  taskListRef,
  taskListWidth,
  tasks,
  TaskListHeader,
  TaskListTable,
}) => {
  const renderedIndexes = useOptimizedList(
    taskListContainerRef,
    'scrollTop',
    fullRowHeight,
  );

  const selectedTaskId = selectedTask ? selectedTask.id : "";

  const [{ isScrollingToTop }, scrollToTopRef] = useDrop({
    accept: ROW_DRAG_TYPE,

    collect: (monitor) => ({
      isScrollingToTop: monitor.isOver(),
    }),

    canDrop: () => false,
  }, []);

  const [{ isScrollingToBottom }, scrollToBottomRef] = useDrop({
    accept: ROW_DRAG_TYPE,

    collect: (monitor) => ({
      isScrollingToBottom: monitor.isOver(),
    }),

    canDrop: () => false,
  }, [scrollToBottomStep]);

  useEffect(() => {
    if (!isScrollingToTop) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      scrollToTopStep();
    }, SCROLL_DELAY);

    return () => {
      clearInterval(intervalId);
    }
  }, [isScrollingToTop, scrollToTopStep]);

  useEffect(() => {
    if (!isScrollingToBottom) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      scrollToBottomStep();
    }, SCROLL_DELAY);

    return () => {
      clearInterval(intervalId);
    }
  }, [isScrollingToBottom, scrollToBottomStep]);

  return (
    <div ref={taskListRef}>
      <TaskListHeader
        headerHeight={distances.headerHeight}
        fontFamily={fontFamily}
        fontSize={fontSize}
        columns={columns}
        columnResizeEvent={columnResizeEvent}
        onResizeStart={onResizeStart}
        canResizeColumns={canResizeColumns}
      />

      <div className={styles.tableWrapper}>
        <div
          ref={taskListContainerRef}
          className={horizontalContainerClass}
          style={distances.ganttHeight ? { height: distances.ganttHeight } : {}}
        >
          <div
            style={{
              height: ganttFullHeight,
              backgroundSize: `100% ${fullRowHeight * 2}px`,
              backgroundImage: `linear-gradient(to bottom, transparent ${fullRowHeight}px, #f5f5f5 ${fullRowHeight}px)`,
            }}
          >
            <TaskListTable
              canMoveTasks={canMoveTasks}
              childTasksMap={childTasksMap}
              closedTasks={closedTasks}
              columnResizeEvent={columnResizeEvent}
              columns={columns}
              dateSetup={dateSetup}
              distances={distances}
              fontFamily={fontFamily}
              fontSize={fontSize}
              fullRowHeight={fullRowHeight}
              ganttFullHeight={ganttFullHeight}
              handleAddTask={handleAddTask}
              handleDeteleTask={handleDeteleTask}
              handleEditTask={handleEditTask}
              handleMoveTaskAfter={handleMoveTaskAfter}
              handleMoveTaskInside={handleMoveTaskInside}
              icons={icons}
              isShowTaskNumbers={isShowTaskNumbers}
              mapTaskToNestedIndex={mapTaskToNestedIndex}
              onExpanderClick={onExpanderClick}
              renderedIndexes={renderedIndexes}
              scrollToTask={scrollToTask}
              selectedTaskId={selectedTaskId}
              setSelectedTask={setSelectedTask}
              taskListWidth={taskListWidth}
              tasks={tasks}
            />
          </div>
        </div>

        <div
          className={cx(styles.scrollToTop, {
            [styles.hidden]: !renderedIndexes || renderedIndexes[2],
          })}
          ref={scrollToTopRef}
        />

        <div
          className={cx(styles.scrollToBottom, {
            [styles.hidden]: !renderedIndexes || renderedIndexes[3],
          })}
          ref={scrollToBottomRef}
        />
      </div>
    </div>
  );
};

export const TaskList = memo(TaskListInner);
