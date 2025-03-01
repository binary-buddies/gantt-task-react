import React, { memo, SyntheticEvent, useMemo } from "react";
import type { CSSProperties, RefObject } from "react";
import styled from "styled-components";

import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import { usePopper } from 'react-popper';
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

const StyledDiv = styled.div`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  padding: 8px;
`;

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

  const [arrowAnchorEl, setArrowAnchorEl] = React.useState<null | SVGElement>(null);
  const [arrowPopperElement, setArrowPopperElement] = React.useState<null | HTMLDivElement>(null);
  const { styles: arrowStyles, attributes: arrowAttributes } = usePopper(arrowAnchorEl, arrowPopperElement);

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

  const [popperElement, setPopperElement] = React.useState<null | HTMLDivElement>(null);
  const { styles, attributes } = usePopper(anchorEl, popperElement);

  React.useEffect(() => {
    const handleClickAway = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (popperElement && !popperElement.contains(target) && anchorEl && !anchorEl.contains(target)) {
        setAnchorEl(null);
        setSelectedTask(null);
      }
      if (arrowPopperElement && !arrowPopperElement.contains(target) && arrowAnchorEl && !arrowAnchorEl.contains(target)) {
        setArrowAnchorEl(null);
        setSelectedDependency(null);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('touchstart', handleClickAway);

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('touchstart', handleClickAway);
    };
  }, [popperElement, anchorEl, arrowPopperElement, arrowAnchorEl]);

  return (
    <div
      className={styles.ganttTaskRoot as string}
      ref={ganttTaskRootRef}
      onScroll={onVerticalScrollbarScrollX}
      dir="ltr"
    >
      <Calendar {...calendarProps} colors={colors} />

      <div
        ref={ganttTaskContentRef}
        className={styles.ganttTaskContent as string}
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
          <div
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <StyledDiv>{contextualPalette}</StyledDiv>
          </div>
        )}
        {barProps.TaskDependencyContextualPalette &&
          isArrowContextualPaletteOpened && (
            <div
              ref={setArrowPopperElement}
              style={arrowStyles.popper}
              {...arrowAttributes.popper}
            >
              <StyledDiv>{arrowContextualPalette}</StyledDiv>
            </div>
          )}
      </div>
    </div>
  );
};

export const TaskGantt = memo(TaskGanttInner);
