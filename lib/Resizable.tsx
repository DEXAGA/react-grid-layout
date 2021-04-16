import * as React from 'react';
import {SyntheticEvent} from 'react';
import DraggableCore from './DraggableCore';
import {cloneElement} from './utils';
import {DragCallbackData, ResizeHandleAxis} from "./propTypes";

const Resizable = (props) => {

  let lastHandleRect = null;
  let slack = null;

  const resetData = () => {
    lastHandleRect = slack = null;
  }


  React.useEffect(() => {
    return () => {
      resetData();
    }
  }, [])

  // Clamp width and height within provided constraints
  const runConstraints = (width: number, height: number): [number, number] => {
    const [min, max] = [props.minConstraints, props.maxConstraints];
    if (!min && !max) return [width, height];

    // If constraining to min and max, we need to also fit width and height to aspect ratio.
    if (props.lockAspectRatio) {
      const resizingHorizontally = height === props.height;
      if (resizingHorizontally) {
        const ratio = props.width / props.height;
        height = width / ratio;
        width = height * ratio;
      } else {
        // Take into account vertical resize with N/S handles on locked aspect
        // ratio. Calculate the change height-first, instead of width-first
        const ratio = props.height / props.width;
        width = height / ratio;
        height = width * ratio;
      }
    }

    const [oldW, oldH] = [width, height];

    // Add slack to the values used to calculate bound position. This will ensure that if
    // we start removing slack, the element won't react to it right away until it's been
    // completely removed.
    let [slackW, slackH] = slack || [0, 0];
    width += slackW;
    height += slackH;

    if (min) {
      width = Math.max(min[0], width);
      height = Math.max(min[1], height);
    }
    if (max) {
      width = Math.min(max[0], width);
      height = Math.min(max[1], height);
    }

    // If the width or height changed, we must have introduced some slack. Record it for the next iteration.
    slack = [slackW + (oldW - width), slackH + (oldH - height)];

    return [width, height];
  }

  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  const resizeHandler = (handlerName: 'onResize' | 'onResizeStart' | 'onResizeStop', axis: ResizeHandleAxis) => {
    return (e: SyntheticEvent<any>, {node, deltaX, deltaY}: DragCallbackData) => {
      // Reset data in case it was left over somehow (should not be possible)
      if (handlerName === 'onResizeStart') resetData();

      // Axis restrictions
      const canDragX = (props.axis === 'both' || props.axis === 'x') && axis !== 'n' && axis !== 's';
      const canDragY = (props.axis === 'both' || props.axis === 'y') && axis !== 'e' && axis !== 'w';
      // No dragging possible.
      if (!canDragX && !canDragY) return;

      // Decompose axis for later use
      const axisV = axis[0];
      const axisH = axis[axis.length - 1]; // intentionally not axis[1], so that this catches axis === 'w' for example

      // Track the element being dragged to account for changes in position.
      // If a handle's position is changed between callbacks, we need to factor this in to the next callback.
      // Failure to do so will cause the element to "skip" when resized upwards or leftwards.
      const handleRect = node.getBoundingClientRect();
      if (lastHandleRect != null) {
        // If the handle has repositioned on either axis since last render,
        // we need to increase our callback values by this much.
        // Only checking 'n', 'w' since resizing by 's', 'w' won't affect the overall position on page,
        if (axisH === 'w') {
          const deltaLeftSinceLast = handleRect.left - lastHandleRect.left;
          deltaX += deltaLeftSinceLast;
        }
        if (axisV === 'n') {
          const deltaTopSinceLast = handleRect.top - lastHandleRect.top;
          deltaY += deltaTopSinceLast;
        }
      }
      // Storage of last rect so we know how much it has really moved.
      lastHandleRect = handleRect;

      // Reverse delta if using top or left drag handles.
      if (axisH === 'w') deltaX = -deltaX;
      if (axisV === 'n') deltaY = -deltaY;

      // Update w/h by the deltas. Also factor in transformScale.
      let width = props.width + (canDragX ? deltaX / props.transformScale : 0);
      let height = props.height + (canDragY ? deltaY / props.transformScale : 0);

      // Run user-provided constraints.
      [width, height] = runConstraints(width, height);

      const dimensionsChanged = width !== props.width || height !== props.height;

      // Call user-supplied callback if present.
      const cb = typeof props[handlerName] === 'function' ? props[handlerName] : null;
      // Don't call 'onResize' if dimensions haven't changed.
      const shouldSkipCb = handlerName === 'onResize' && !dimensionsChanged;
      if (cb && !shouldSkipCb) {
        if (typeof e.persist === 'function') e.persist();
        cb(e, {node, size: {width, height, deltaX, deltaY}, handle: axis});
      }

      // Reset internal data
      if (handlerName === 'onResizeStop') resetData();
    };
  }


  // What we're doing here is getting the child of this element, and cloning it with this element's props.
  // We are then defining its children as:
  // Its original children (resizable's child's children), and
  // One or more draggable handles.
  return cloneElement(props.children, {
    ...props,
    className: `${props.className ? `${(props.className)} ` : ''}react-resizable`,
    children: [
      props.children.props.children,
      ...props.resizeHandles.map((handleAxis) => (
              <DraggableCore
                      {...(props.draggableOpts ?? {})}
                      key={`resizableHandle-${handleAxis}`}
                      onStop={resizeHandler('onResizeStop', handleAxis)}
                      onStart={resizeHandler('onResizeStart', handleAxis)}
                      onDrag={resizeHandler('onResize', handleAxis)}
              >
                {props.handle ? typeof props.handle === 'function' ? props.handle(handleAxis) : props.handle :
                        <span className={`react-resizable-handle react-resizable-handle-${handleAxis}`}/>}
              </DraggableCore>
      ))
    ]
  });
}

Resizable.defaultProps = {
  handleSize: [20, 20],
  lockAspectRatio: false,
  axis: 'both',
  minConstraints: [20, 20],
  maxConstraints: [Infinity, Infinity],
  resizeHandles: ['se'],
  transformScale: 1
};

export default Resizable
