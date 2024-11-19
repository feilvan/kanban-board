import React, { forwardRef } from "react";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const OverlayItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <div {...props} ref={ref}>
        {children}
      </div>
    );
  },
);

OverlayItem.displayName = "OverlayItem";

export default OverlayItem;
