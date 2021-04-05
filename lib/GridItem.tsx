
// @ts-ignore
import classNames from "classnames";
import React from "react";
import {DraggableCore} from "react-draggable";
// @ts-ignore
import {Resizable} from "react-resizable";
import {
  calcGridColWidth,
  calcGridItemPosition,
  calcGridItemWHPx,
  calcGridRowHeight,
  calcWH,
  calcXY,
  clamp
} from "./calculateUtils";
import {perc, Position, setTopLeft, setTransform} from "./utils";


/**
 * An individual item within a ReactGridLayout.
 */
const GridItem = (props: { [x: string]: any; cols?: any; containerPadding?: any; containerWidth?: any; containerHeight?: any; margin?: any; maxRows?: any; rowHeight?: any; w?: any; h?: any; i?: any; x?: any; minW?: any; minH?: any; maxW?: any; maxH?: any; y?: any; isDraggable?: any; handle?: any; cancel?: any; transformScale?: any; isResizable?: any; resizeHandles?: any; resizeHandle?: any; children?: any; className?: any; static?: any; droppingPosition?: any; useCSSTransforms?: any; style?: any; onDragStart?: any; onDrag?: any; isBounded?: any; onDragStop?: any; usePercentages?: any; }) => {
  const [state, setState] = React.useState({
    resizing: null,
    dragging: null,
    className: ""
  })
  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      resizing: null,
      dragging: null,
      className: ""
    }))
  }, [])

  const elementRef: any = React.createRef();

  // shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
  //   // We can't deeply compare children. If the developer memoizes them, we can
  //   // use this optimization.
  //   if (props.children !== nextProps.children) return true;
  //   if (props.droppingPosition !== nextProps.droppingPosition) return true;
  //   // TODO memoize these calculations so they don't take so long?
  //   const oldPosition = calcGridItemPosition(
  //     getPositionParams(props),
  //     props.x,
  //     props.y,
  //     props.w,
  //     props.h,
  //     state
  //   );
  //   const newPosition = calcGridItemPosition(
  //     getPositionParams(nextProps),
  //     nextProps.x,
  //     nextProps.y,
  //     nextProps.w,
  //     nextProps.h,
  //     nextState
  //   );
  //   return (
  //     !fastPositionEqual(oldPosition, newPosition) ||
  //     props.useCSSTransforms !== nextProps.useCSSTransforms
  //   );
  // }

  // React.useEffect(() => {
  //   moveDroppingItem(prevProps);
  // })

  const getPositionParams = () => {
    return {
      cols: props.cols,
      containerPadding: props.containerPadding,
      containerWidth: props.containerWidth,
      containerHeight: props.containerHeight,
      margin: props.margin,
      maxRows: props.maxRows,
      rowHeight: props.rowHeight,
      // nbRow: bottom(state.layout),
    };
  }


  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  const onResizeHandler = (
          e: Event,
          {node, size}:any ,
          handlerName: string
  ) => {
    const handler = props[handlerName];
    if (!handler) return;
    const {cols, x, y, i, maxH, minH} = props;
    let {minW, maxW} = props;

    // Get new XY
    let {w, h} = calcWH(
            getPositionParams(),
            size.width,
            size.height,
            x,
            y
    );

    // minW should be at least 1 (TODO propTypes validation?)
    minW = Math.max(minW, 1);

    // maxW should be at most (cols - x)
    maxW = Math.min(maxW, cols - x);

    // Min/max capping
    w = clamp(w, minW, maxW);
    h = clamp(h, minH, maxH);

    setState(prevState => ({
      ...prevState,
      resizing: handlerName === "onResizeStop" ? null : size,
    }));

    handler.call(this, i, w, h, {e, node, size});
  }

  /**
   * onDragStart event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  const onDragStart = (e:Event, {node}:any) => {
    const {onDragStart, transformScale} = props;
    if (!onDragStart) return;

    const newPosition  = {top: 0, left: 0};

    // TODO: this wont work on nested parents
    const {offsetParent} = node;
    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    const cLeft = clientRect.left / transformScale;
    const pLeft = parentRect.left / transformScale;
    const cTop = clientRect.top / transformScale;
    const pTop = parentRect.top / transformScale;
    newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
    newPosition.top = cTop - pTop + offsetParent.scrollTop;
    // @ts-ignore
    setState(prevState => ({
      ...prevState,
      dragging: newPosition,
    }));

    // Call callback with this data
    const {x, y} = calcXY(
            getPositionParams(),
            newPosition.top,
            newPosition.left,
            props.w,
            props.h
    );

    return onDragStart.call(this, props.i, x, y, {
      e,
      node,
      newPosition
    });
  };

  /**
   * onDrag event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  const onDrag = (
          e:Event,
          {node, deltaX, deltaY}: {node: any, deltaX: any, deltaY: any}
  ) => {
    const {onDrag} = props;
    if (!onDrag) return;

    if (!state.dragging) {
      throw new Error("onDrag called before onDragStart.");
    }
    // @ts-ignore
    let top = state?.dragging?.top + deltaY;
    // @ts-ignore
    let left = state?.dragging?.left + deltaX;

    const {isBounded, i, w, h, containerWidth, containerHeight} = props;
    const positionParams = getPositionParams();

    // Boundary calculations; keeps items within the grid
    if (isBounded) {
      const {offsetParent} = node;

      if (offsetParent) {
        const {margin} = props;
        const rowHeight = calcGridRowHeight(positionParams);
        const bottomBoundary =
                containerHeight - calcGridItemWHPx(h, rowHeight, margin[1]);
        top = clamp(top, 0, bottomBoundary);

        const colWidth = calcGridColWidth(positionParams);
        const rightBoundary =
                containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
        left = clamp(left, 0, rightBoundary);
      }
    }

    const newPosition  = {top, left};
    // @ts-ignore
    setState(prevState => ({
      ...prevState,
      dragging: newPosition,
    }));

    // Call callback with this data
    const {x, y} = calcXY(positionParams, top, left, w, h);
    return onDrag.call(this, i, x, y, {
      e,
      node,
      newPosition
    });
  };

  /**
   * onDragStop event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  const onDragStop = (e:Event, {node}:any) => {
    const {onDragStop} = props;
    if (!onDragStop) return;

    if (!state.dragging) {
      throw new Error("onDragEnd called before onDragStart.");
    }
    const {w, h, i} = props;

    const {left, top}: any = state.dragging;
    const newPosition  = {top, left};
    setState(prevState => ({
      ...prevState,
      dragging: null,
    }));

    const {x, y} = calcXY(getPositionParams(), top, left, w, h);

    return onDragStop.call(this, i, x, y, {
      e,
      node,
      newPosition
    });
  };


  // When a droppingPosition is present, this means we should fire a move event, as if we had moved
  // this element by `x, y` pixels.
  const moveDroppingItem = (prevProps: { droppingPosition?: any; } ) => {
    const {droppingPosition} = props;
    if (!droppingPosition) return;
    const node = elementRef.current;
    // Can't find DOM node (are we unmounted?)
    if (!node) return;

    const prevDroppingPosition = prevProps.droppingPosition || {
      left: 0,
      top: 0
    };
    const {dragging}: {  dragging: null; resizing: null; className: string } = state;

    const shouldDrag =
            (dragging && droppingPosition.left !== prevDroppingPosition.left) ||
            droppingPosition.top !== prevDroppingPosition.top;

    if (!dragging) {
      onDragStart(droppingPosition.e, {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top
      });
    } else if (shouldDrag) {
      // @ts-ignore
      const deltaX = droppingPosition.left - dragging?.left;
      // @ts-ignore
      const deltaY = droppingPosition.top - dragging?.top;

      onDrag(droppingPosition.e, {
        node,
        deltaX,
        deltaY
      });
    }
  }

  React.useEffect(() => {
    moveDroppingItem({});
  }, [])
  // React.useEffect(() => {
  //   moveDroppingItem({});
  // })


  /**
   * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
   * well when server rendering, and the only way to do that properly is to use percentage width/left because
   * we don't know exactly what the browser viewport is.
   * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
   * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
   *
   * @param  {Object} pos Position object with width, height, left, top.
   * @return {Object}     Style object.
   */
  const createStyle = (pos: Position ) => {
    const {usePercentages, containerWidth, useCSSTransforms} = props;

    let style: any =undefined;
    // CSS Transforms support (default)
    if (useCSSTransforms) {
      style = setTransform(pos);
    } else {
      // top,left (slow)
      style = setTopLeft(pos);

      // This is used for server rendering.
      if (usePercentages) {
        style.left = perc(pos.left / containerWidth);
        style.width = perc(pos.width / containerWidth);
      }
    }

    return style;
  }

  const positionParams = getPositionParams();

  // This is the max possible width - doesn't go to infinity because of the width of the window
  const maxWidth = calcGridItemPosition(positionParams, 0, 0, props.cols - props.x, 0, {
    dragging: undefined,
    resizing: undefined
  })
          .width;

  // Calculate min/max constraints using our min & maxes
  const mins = calcGridItemPosition(positionParams, 0, 0, props.minW, props.minH, {
    dragging: undefined,
    resizing: undefined
  });
  const maxes = calcGridItemPosition(positionParams, 0, 0, props.maxW, props.maxH, {
    dragging: undefined,
    resizing: undefined
  });
  const minConstraints = [mins.width, mins.height];
  const maxConstraints = [
    Math.min(maxes.width, maxWidth),
    Math.min(maxes.height, Infinity)
  ];

  const newPosition: any = calcGridItemPosition(
          getPositionParams(),
          props.x,
          props.y,
          props.w,
          props.h,
          state
  );

  // console.log(props, newPosition)
  // console.log(props.i, newPosition)
  return (
  // @ts-ignore
          <DraggableCore
                  disabled={!props.isDraggable}
                  onStart={onDragStart}
                  onDrag={onDrag}
                  onStop={onDragStop}
                  handle={props.handle}
                  cancel={
                    ".react-resizable-handle" +
                    (props.cancel ? "," + props.cancel : "")
                  }
                  scale={props.transformScale}
                  nodeRef={elementRef}

          >
            <Resizable
                    draggableOpts={{
                      disabled: !props.isResizable,
                      nodeRef: elementRef
                    }}
                    className={props.isResizable ? undefined : "react-resizable-hide"}
                    width={newPosition.width}
                    height={newPosition.height}
                    minConstraints={minConstraints}
                    maxConstraints={maxConstraints}
                    onResizeStop={(
                            e: Event,
                            callbackData: any
                    ) => {
                      onResizeHandler(e, callbackData, "onResizeStop");
                    }}
                    onResizeStart={(
                            e: Event,
                            callbackData: any
                    ) => {
                      onResizeHandler(e, callbackData, "onResizeStart");
                    }}
                    onResize={(
                            e: Event,
                            callbackData: any
                    ) => {
                      onResizeHandler(e, callbackData, "onResize");
                    }}
                    transformScale={props.transformScale}
                    resizeHandles={props.resizeHandles}
                    handle={props.resizeHandle}
            >
              {React.cloneElement(React.Children.only(props.children), {
                ref: elementRef,
                className: classNames(
                        "react-grid-item",
                        React.Children.only(props.children).props.className,
                        props.className,
                        {
                          static: props.static,
                          resizing: Boolean(state.resizing),
                          "react-draggable": props.isDraggable,
                          "react-draggable-dragging": Boolean(state.dragging),
                          dropping: Boolean(props.droppingPosition),
                          cssTransforms: props.useCSSTransforms
                        }
                ),
                // We can set the width and height on the child, but unfortunately we can't set the position.
                style: {
                  ...props.style,
                  ...React.Children.only(props.children).props.style,
                  ...createStyle(newPosition)
                }
              })}
            </Resizable>
          </DraggableCore>
  )
}

GridItem.defaultProps = {
  className: "",
  cancel: "",
  handle: "",
  minH: 1,
  minW: 1,
  maxH: Infinity,
  maxW: Infinity,
  transformScale: 1
}

export default GridItem
