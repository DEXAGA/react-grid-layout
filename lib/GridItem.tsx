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
   * onDragStart event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  const onDragStart = (e:Event, {node}:any) => {
    if (!props.onDragStart) return;

    const newPosition  = {top: 0, left: 0};

    // TODO: this wont work on nested parents
    const {offsetParent} = node;
    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    const cLeft = clientRect.left / props.transformScale;
    const pLeft = parentRect.left / props.transformScale;
    const cTop = clientRect.top / props.transformScale;
    const pTop = parentRect.top / props.transformScale;
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

    return props.onDragStart.call(this, props.i, x, y, {
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
    if (!props.onDrag) return;

    if (!state.dragging) {
      throw new Error("onDrag called before onDragStart.");
    }
    // @ts-ignore
    let top = state?.dragging?.top + deltaY;
    // @ts-ignore
    let left = state?.dragging?.left + deltaX;

    const positionParams = getPositionParams();

    // Boundary calculations; keeps items within the grid
    if (props.isBounded) {

      if (node.offsetParent) {
        const rowHeight = calcGridRowHeight(positionParams);
        const bottomBoundary =
                props.containerHeight - calcGridItemWHPx(props.h, rowHeight, (props.margin)[1]);
        top = clamp(top, 0, bottomBoundary);

        const colWidth = calcGridColWidth(positionParams);
        const rightBoundary =
                props.containerWidth - calcGridItemWHPx(props.w, colWidth, (props.margin)[0]);
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
    const {x, y} = calcXY(positionParams, top, left, props.w, props.h);
    return props.onDrag.call(this, props.i, x, y, {
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
    if (!props.onDragStop) return;

    if (!state.dragging) {
      throw new Error("onDragEnd called before onDragStart.");
    }

    const newPosition  = {top: state.dragging.top, left: state.dragging.left};
    setState(prevState => ({
      ...prevState,
      dragging: null,
    }));

    const {x, y} = calcXY(getPositionParams(), state.dragging.top, state.dragging.left, props.w, props.h);

    return props.onDragStop.call(this, props.i, x, y, {
      e,
      node,
      newPosition
    });
  };

  let onResizeStart = (
          e: Event,
          callbackData: any
  ) => {
    const newPosition  = {top: 0, left: 0};

    // TODO: this wont work on nested parents
    if (!callbackData.node.offsetParent) return;
    const parentRect = callbackData.node.offsetParent.getBoundingClientRect();
    const clientRect = callbackData.node.getBoundingClientRect();
    const cLeft = clientRect.left / props.transformScale;
    const pLeft = parentRect.left / props.transformScale;
    const cTop = clientRect.top / props.transformScale;
    const pTop = parentRect.top / props.transformScale;
    newPosition.left = cLeft - pLeft + callbackData.node.offsetParent.scrollLeft;
    newPosition.top = cTop - pTop + callbackData.node.offsetParent.scrollTop;
    newPosition.width = clientRect.width / props.transformScale
    newPosition.height = clientRect.height / props.transformScale


    if (!props.onResizeStart) return

    const handleOrientation = ["sw", "w", "nw"].indexOf(callbackData.handle) != -1 ? "west" : "east";

    // Get new XY
    let {w, h} = calcWH(
            getPositionParams(),
            callbackData.size.width,
            callbackData.size.height,
            props.x,
            props.y,
            handleOrientation
    );

    // Min/max capping
    w = clamp(w, Math.max(props.minW, 1), handleOrientation === "west" ? Math.min(props.maxW, props.cols) : Math.min(props.maxW, props.cols - props.x));
    h = clamp(h, props.minH, props.maxH);

    setState(prevState => ({
      ...prevState,
      resizing: newPosition,
      resizeStartPos: newPosition
    }));

    props.onResizeStart.call(this, props.i, w, h, {e, node: callbackData.node, size: newPosition, handle: props.handle});
  };

  let onResize = (
          e: Event,
          callbackData: any
  ) => {
    if (!props.onResize) return

    const handleOrientation = ["sw", "w", "nw"].indexOf(callbackData.handle) != -1 ? "west" : "east";

    // Get new XY
    let {w, h} = calcWH(
            getPositionParams(),
            callbackData.size.width,
            callbackData.size.height,
            props.x,
            props.y,
            handleOrientation
    );

    // Min/max capping
    w = clamp(w, Math.max(props.minW, 1), handleOrientation === "west" ? Math.min(props.maxW, props.cols) : Math.min(props.maxW, props.cols - props.x));
    h = clamp(h, props.minH, props.maxH);

    let elem = callbackData.node.parentNode;
    if (elem) {
      let currentLeft, currentTop;
      if (props.useCSSTransforms) {
        const transformCSS = elem.style.transform
                .replace(/[^\d.,]/g, "")
                .split(",")
        currentLeft = parseInt(transformCSS[0], 10);
        currentTop = parseInt(transformCSS[1], 10);
      } else {
        currentLeft = parseInt(elem.style.left, 10);
        currentTop = parseInt(elem.style.top, 10);
      }

      const currentWidth = elem.offsetWidth;
      const currentHeight = elem.offsetHeight;

      if (
              [
                "sw",
                "w",
                "nw",
                "n",
                "ne"
              ].indexOf(callbackData.handle) === -1
      ) {
        setState(prevState => ({
          ...prevState,
          resizing: callbackData.size
        }));
      } else {
        if (["sw", "w"].indexOf(callbackData.handle) !== -1) {
          callbackData.size.left = currentLeft - (callbackData.size.width - currentWidth);
          callbackData.size.top = currentTop;
        } else if (
                ["n", "ne"].indexOf(callbackData.handle) !== -1
        ) {
          callbackData.size.left = currentLeft;
          callbackData.size.top = currentTop - (callbackData.size.height - currentHeight);
        } else {
          callbackData.size.left = currentLeft - (callbackData.size.width - currentWidth);
          callbackData.size.top = currentTop - (callbackData.size.height - currentHeight);
        }
        callbackData.size.left = callbackData.size.left < 0 ? 0 : callbackData.size.left;
        callbackData.size.top = callbackData.size.top < 0 ? 0 : callbackData.size.top;
      }
      console.log(state, props, callbackData.size)
      setState(prevState => ({
        ...prevState,
        resizing: callbackData.size
      }));
    }

    props.onResize.call(this, props.i, w, h, {e, node: elem, size: callbackData.size, handle: callbackData.handle});
  };

  let onResizeStop = (
          e: Event,
          callbackData: any
  ) => {
    if (!props.onResizeStop) return

    const handleOrientation = ["sw", "w", "nw"].indexOf(callbackData.handle) != -1 ? "west" : "east";

    // Get new XY
    let {w, h} = calcWH(
            getPositionParams(),
            callbackData.size.width,
            callbackData.size.height,
            props.x,
            props.y,
            handleOrientation
    );

    // Min/max capping
    w = clamp(w, Math.max(props.minW, 1), handleOrientation === "west" ? Math.min(props.maxW, props.cols) : Math.min(props.maxW, props.cols - props.x));
    h = clamp(h, props.minH, props.maxH);

    if (callbackData.node) {
      let currentLeft, currentTop;
      if (props.useCSSTransforms) {
        const transformCSS = callbackData.node.style.transform
                .replace(/[^\d.,]/g, "")
                .split(",")
        currentLeft = parseInt(transformCSS[0], 10);
        currentTop = parseInt(transformCSS[1], 10);
      } else {
        currentLeft = parseInt(callbackData.node.style.left, 10);
        currentTop = parseInt(callbackData.node.style.top, 10);
      }

      const currentWidth = callbackData.node.offsetWidth;
      const currentHeight = callbackData.node.offsetHeight;

      if (
              [
                "sw",
                "w",
                "nw",
                // "n",
                "ne"
              ].indexOf(callbackData.handle) === -1
      ) {
        setState(prevState => ({
          ...prevState,
          resizing: null,
          resizeStartPos: null,
        }));
      } else {
        if (["sw", "w"].indexOf(callbackData.handle) !== -1) {
          callbackData.size.left = currentLeft - (callbackData.size.width - currentWidth);
          callbackData.size.top = currentTop;
        } else if (
                ["n", "ne"].indexOf(callbackData.handle) !== -1
        ) {
          callbackData.size.left = currentLeft;
          callbackData.size.top = currentTop - (callbackData.size.height - currentHeight);
        } else {
          callbackData.size.left = currentLeft - (callbackData.size.width - currentWidth);
          callbackData.size.top = currentTop - (callbackData.size.height - currentHeight);
        }
        callbackData.size.left = callbackData.size.left < 0 ? 0 : callbackData.size.left;
        callbackData.size.top = callbackData.size.top < 0 ? 0 : callbackData.size.top;
      }
      setState(prevState => ({
        ...prevState,
        resizing: null,
        resizeStartPos: null,
      }));
    }

    props.onResizeStop.call(this, props.i, w, h, {e, node: callbackData.node, size: callbackData.size, handle: callbackData.handle});
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
  const maxWidth = calcGridItemPosition(positionParams, 0, 0, props.cols, 0, {
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
                    onResizeStop={onResizeStop}
                    onResizeStart={onResizeStart}
                    onResize={onResize}
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
