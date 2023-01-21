import React from "react";
import type {
  RefObject,
  SyntheticEvent,
} from "react";

import styles from "./horizontal-scroll.module.css";

export const HorizontalScroll: React.FC<{
  horizontalScrollbarRef: RefObject<HTMLDivElement>;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
  rtl: boolean;
  svgWidth: number;
  taskListWidth: number;
}> = ({
  horizontalScrollbarRef,
  svgWidth,
  taskListWidth,
  rtl,
  onScroll,
}) => {
  return (
    <div
      dir="ltr"
      style={{
        margin: rtl
          ? `0px ${taskListWidth}px 0px 0px`
          : `0px 0px 0px ${taskListWidth}px`,
      }}
      className={styles.scrollWrapper}
      onScroll={onScroll}
      ref={horizontalScrollbarRef}
    >
      <div style={{ width: svgWidth }} className={styles.scroll} />
    </div>
  );
};
