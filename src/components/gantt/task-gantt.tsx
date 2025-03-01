import React, { memo, SyntheticEvent, useMemo } from "react";
import type { CSSProperties, RefObject } from "react";

import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import styles from "./gantt.module.css";
import {
  TaskContextualPaletteProps,
  Task,
  Distances,
  DateExtremity,
  TaskDependencyContextualPaletteProps, ColorStyles
} from "../../types/public-types";

export type TaskGanttProps = {
  barProps: TaskGanttContentProps;
  calendarProps: CalendarProps;
  gridProps: GridProps;
  distances: Distances;
  fullRowHeight: number;
  fullSvgWidth: number;
  ganttFullHeight: number;
  ganttSVGRef: RefObject<SVGSVGElement>;
  ganttTaskContentRef: RefObject<HTMLDivElement>;
  onVerticalScrollbarScrollX: (event: SyntheticEvent<HTMLDivElement>) => void;
  ganttTaskRootRef: RefObject<HTMLDivElement>;
  onScrollGanttContentVertically: (
    event: SyntheticEvent<HTMLDivElement>
  ) => void;
  colors: Partial<ColorStyles>
};

const TaskGanttInner: React.FC<TaskGanttProps> = (props) => {
  const {
    barProps,
    barProps: { additionalLeftSpace },
    calendarProps,
    fullRowHeight,
    fullSvgWidth,
    ganttFullHeight,
    ganttSVGRef,
    gridProps,
    distances: { columnWidth, rowHeight, minimumRowDisplayed },
    ganttTaskContentRef,
    onVerticalScrollbarScrollX,
    ganttTaskRootRef,
    onScrollGanttContentVertically: onScrollVertically,
    colors
  } = props;
  const containerStyle: CSSProperties = {
    // In order to see the vertical scrollbar of the gantt content,
    // we resize dynamically the width of the gantt content
    height: Math.max(ganttFullHeight, minimumRowDisplayed * rowHeight),
    width: ganttTaskRootRef?.current
      ? ganttTaskRootRef.current.clientWidth +
        ganttTaskRootRef.current.scrollLeft
      : fullSvgWidth,
  };

  const gridStyle = useMemo<CSSProperties>(
    () => ({
      height: Math.max(ganttFullHeight, minimumRowDisplayed * rowHeight),
      width: fullSvgWidth,
      backgroundSize: `${columnWidth}px ${fullRowHeight * 2}px`,
      backgroundPositionX: additionalLeftSpace || undefined,
      backgroundImage: [
        `linear-gradient(to right, #ebeff2 1px, transparent 2px)`,
        `linear-gradient(to bottom, transparent ${fullRowHeight}px, #f5f5f5 ${fullRowHeight}px)`,
      ].join(", "),
    }),
    [
      additionalLeftSpace,
      columnWidth,
      fullRowHeight,
      fullSvgWidth,
      ganttFullHeight,
    ]
  );

  const [arrowAnchorEl, setArrowAnchorEl] = React.useState<null | SVGElement>(
    null
  );
  const [selectedDependency, setSelectedDependency] = React.useState<{
    taskFrom: Task;
    extremityFrom: DateExtremity;
    taskTo: Task;
    extremityTo: DateExtremity;
  }>(null);
  const isArrowContextualPaletteOpened = Boolean(arrowAnchorEl);
  const onClickArrow: (
    taskFrom: Task,
    extremityFrom: DateExtremity,
    taskTo: Task,
    extremityTo: DateExtremity,
    event: React.MouseEvent<SVGElement>
  ) => void = (taskFrom, extremityFrom, taskTo, extremityTo, event) => {
    setArrowAnchorEl(event.currentTarget);
    setSelectedDependency({ taskFrom, extremityFrom, taskTo, extremityTo });
  };

  const onCloseArrowContextualPalette = () => {
    setArrowAnchorEl(null);
  };

  let arrowContextualPalette:
    | React.FunctionComponentElement<TaskDependencyContextualPaletteProps>
    | undefined = undefined;
  if (barProps.TaskDependencyContextualPalette && selectedDependency) {
    arrowContextualPalette = React.createElement(
      barProps.TaskDependencyContextualPalette,
      {
        taskFrom: selectedDependency.taskFrom,
        extremityFrom: selectedDependency.extremityFrom,
        taskTo: selectedDependency.taskTo,
        extremityTo: selectedDependency.extremityTo,
        onClosePalette: onCloseArrowContextualPalette,
      }
    );
  } else {
    arrowContextualPalette = <div></div>;
  }

  const onArrowClickAway = (e: MouseEvent | TouchEvent) => {
    const svgElement = e.target as SVGElement;
    if (svgElement) {
      const keepPalette =
        svgElement.ownerSVGElement?.classList.contains("ArrowClassName");
      // In a better world the contextual palette should be defined in TaskItem component but ClickAwayListener and Popper uses div that are not displayed in svg
      // So in order to let the palette open when clicking on another task, this checks if the user clicked on another task
      if (!keepPalette) {
        setArrowAnchorEl(null);
        setSelectedDependency(null);
      }
    }
  };

  // Manage the contextual palette
  const [anchorEl, setAnchorEl] = React.useState<null | SVGElement>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task>(null);
  const open = Boolean(anchorEl);
  const onClickTask: (
    task: Task,
    event: React.MouseEvent<SVGElement>
  ) => void = (task, event) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
    barProps.onClick(task, event);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  let contextualPalette:
    | React.FunctionComponentElement<TaskContextualPaletteProps>
    | undefined = undefined;
  if (barProps.ContextualPalette && selectedTask) {
    contextualPalette = React.createElement(barProps.ContextualPalette, {
      selectedTask,
      onClosePalette: onClose,
    });
  } else {
    contextualPalette = <div></div>;
  }

  const onClickAway = (e: MouseEvent | TouchEvent) => {
    const svgElement = e.target as SVGElement;
    if (svgElement) {
      const keepPalette =
        svgElement.ownerSVGElement?.classList.contains("TaskItemClassName");
      // In a better world the contextual palette should be defined in TaskItem component but ClickAwayListener and Popper uses div that are not displayed in svg
      // So in order to let the palette open when clicking on another task, this checks if the user clicked on another task
      if (!keepPalette) {
        setAnchorEl(null);
        setSelectedTask(null);
      }
    }
  };

  // Custom Popper component
  const CustomPopper: React.FC<{ open: boolean; anchorEl: HTMLElement | null; children: React.ReactNode }> = ({ open, anchorEl, children }) => {
    if (!open || !anchorEl) return null;
    const style = {
      position: 'absolute',
      top: anchorEl.getBoundingClientRect().top,
      left: anchorEl.getBoundingClientRect().left,
      zIndex: 1000,
    };
    return <div style={style}>{children}</div>;
  };

  // Custom ClickAwayListener component
  const CustomClickAwayListener: React.FC<{ onClickAway: (event: MouseEvent | TouchEvent) => void; children: React.ReactNode }> = ({ onClickAway, children }) => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof Node && !event.currentTarget.contains(event.target)) {
        onClickAway(event);
      }
    };

    return <div onClick={handleClick}>{children}</div>;
  };

  // Custom Paper component
  const CustomPaper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const style = {
      background: '#fff',
      padding: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    };
    return <div style={style}>{children}</div>;
  };

  return (
    <div
      className={styles.ganttTaskRoot}
      ref={ganttTaskRootRef}
      onScroll={onVerticalScrollbarScrollX}
      dir="ltr"
    >
      <Calendar {...calendarProps} colors={colors} />

      <div
        ref={ganttTaskContentRef}
        className={styles.ganttTaskContent}
        style={containerStyle}
        onScroll={onScrollVertically}
      >
        <div style={gridStyle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={fullSvgWidth}
            height={ganttFullHeight}
            fontFamily={barProps.fontFamily}
            ref={ganttSVGRef}
            style={{
              background: colors.oddTaskBackgroundColor
            }}
          >
            <Grid {...gridProps} />
            <TaskGanttContent
              {...barProps}
              onClick={onClickTask}
              onArrowClick={onClickArrow}
            />
          </svg>
        </div>
        {barProps.ContextualPalette && open && (
          <CustomClickAwayListener onClickAway={onClickAway}>
            <CustomPopper
              open={open}
              anchorEl={anchorEl}
            >
              <CustomPaper>{contextualPalette}</CustomPaper>
            </CustomPopper>
          </CustomClickAwayListener>
        )}
        {barProps.TaskDependencyContextualPalette &&
          isArrowContextualPaletteOpened && (
            <CustomClickAwayListener onClickAway={onArrowClickAway}>
              <CustomPopper
                open={isArrowContextualPaletteOpened}
                anchorEl={arrowAnchorEl}
              >
                <CustomPaper>{arrowContextualPalette}</CustomPaper>
              </CustomPopper>
            </CustomClickAwayListener>
          )}
      </div>
    </div>
  );
};

export const TaskGantt = memo(TaskGanttInner);
