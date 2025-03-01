import React from "react";
import style from "./TaskListHeaderActions.module.css";
import { ColorStyles } from "../../types/public-types";
import { MdUnfoldLess, MdUnfoldMore, MdUnfoldMoreDouble } from "react-icons/md";

// Define custom Tooltip and IconButton components
const CustomTooltip: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="custom-tooltip" title={title}>
    {children}
  </div>
);

const CustomIconButton: React.FC<{ onClick: () => void, children: React.ReactNode }> = ({ onClick, children }) => (
  <button className="custom-icon-button" onClick={onClick}>
    {children}
  </button>
);

export type TaskListHeaderActionsProps = {
  onCollapseAll: () => void;
  onExpandFirstLevel: () => void;
  onExpandAll: () => void;
  colors: Partial<ColorStyles>
};

export const TaskListHeaderActions: React.FC<TaskListHeaderActionsProps> =
  ({
     onCollapseAll,
     onExpandFirstLevel,
     onExpandAll
    }) => {
    return (
        <div className={style.taskListHeaderAction}>
          <CustomTooltip title={"Collapse All"}>
            <CustomIconButton onClick={onCollapseAll}>
              <MdUnfoldLess />
            </CustomIconButton>
          </CustomTooltip>
          <CustomTooltip title={"Expand First Level"}>
            <CustomIconButton onClick={onExpandFirstLevel}>
              <MdUnfoldMore />
            </CustomIconButton>
          </CustomTooltip>
          <CustomTooltip title={"Expand All"}>
            <CustomIconButton onClick={onExpandAll}>
              <MdUnfoldMoreDouble />
            </CustomIconButton>
          </CustomTooltip>
        </div>
    );
  };
