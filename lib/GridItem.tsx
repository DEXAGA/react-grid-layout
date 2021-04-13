import classNames from "classnames";
import React from "react";
import {DraggableCore} from "react-draggable-hooks";
import {Resizable} from "react-resizable-hooks";
import {calcGridItemPosition, calcWH, calcXY, clamp} from "./calculateUtils";


/**
 * An individual item within a ReactGridLayout.
 */
const GridItem = (props: { [x: string]: any; cols?: any; containerPadding?: any; containerWidth?: any; containerHeight?: any; margin?: any; maxRows?: any; rowHeight?: any; w?: any; h?: any; i?: any; x?: any; minW?: any; minH?: any; maxW?: any; maxH?: any; y?: any; isDraggable?: any; handle?: any; cancel?: any; transformScale?: any; isResizable?: any; resizeHandles?: any; resizeHandle?: any; children?: any; className?: any; static?: any; droppingPosition?: any; useCSSTransforms?: any; style?: any; onDragStart?: any; onDrag?: any; isBounded?: any; onDragStop?: any; usePercentages?: any; }) => {
  const positionParams = {
    cols: props.cols,
    containerPadding: props.containerPadding,
    containerWidth: props.containerWidth,
    containerHeight: props.containerHeight,
    margin: props.margin,
    maxRows: props.maxRows,
    rowHeight: props.rowHeight,
  };
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


  // When a droppingPosition is present, this means we should fire a move event, as if we had moved
  // this element by `x, y` pixels.
  React.useEffect(() => {
    const {droppingPosition} = props;
    if (!droppingPosition) return;
      const node = elementRef.current;
    // Can't find DOM node (are we unmounted?)
    if (!node) return

      const prevDroppingPosition = {}.droppingPosition || {
        left: 0,
        top: 0
      };
    const {dragging}: { dragging: null; resizing: null; className: string } = state;

    const shouldDrag =
            (dragging && droppingPosition.left !== prevDroppingPosition.left) ||
            droppingPosition.top !== prevDroppingPosition.top;

    if (!dragging) {
      if (!props.onDragStart) return

        const newPosition1 = {top: 0, left: 0};

      // TODO: this wont work on nested parents
      const {offsetParent} = node;
      if (!offsetParent) return
        const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();
      const cLeft = clientRect.left / props.transformScale;
      const pLeft = parentRect.left / props.transformScale;
      const cTop = clientRect.top / props.transformScale;
      const pTop = parentRect.top / props.transformScale;
      newPosition1.left = cLeft - pLeft + offsetParent.scrollLeft;
      newPosition1.top = cTop - pTop + offsetParent.scrollTop;
      // @ts-ignore
      setState(prevState => ({
        ...prevState,
        dragging: newPosition1,
      }));

      // Call callback with this data
      const {x, y} = calcXY(
              positionParams,
              newPosition1.top,
              newPosition1.left,
              props.w,
              props.h
      );

      props.onDragStart.call(GridItem, props.i, x, y, {
        e: droppingPosition.e,
        node,
        newPosition1
      });
    } else if (shouldDrag) {
      // @ts-ignore
      const deltaX = droppingPosition.left - dragging?.left;
      // @ts-ignore
      const deltaY = droppingPosition.top - dragging?.top;

      if (!props.onDrag)

        if (!state.dragging) {
          throw new Error("onDrag called before onDragStart.");
        }
      // @ts-ignore
      let top = state?.dragging?.top + deltaY;
      // @ts-ignore
      let left = state?.dragging?.left + deltaX;


      // Boundary calculations; keeps items within the grid
      if (props.isBounded) {

        if (node.offsetParent) {
          const rowHeight = (
                  (props.containerHeight - (props.margin)[1] * (props.cols - 1) - (props.containerPadding)[1] * 2) / props.cols
          );
          const bottomBoundary =
                  props.containerHeight - (!Number.isFinite(props.h) ? props.h : Math.round(rowHeight * props.h + Math.max(0, props.h - 1) * (props.margin)[1]));
          top = clamp(top, 0, bottomBoundary);

          const colWidth = (
                  (props.containerWidth - (props.margin)[0] * (props.cols - 1) - (props.containerPadding)[0] * 2) / props.cols
          );
          const rightBoundary =
                  props.containerWidth - (!Number.isFinite(props.w) ? props.w : Math.round(colWidth * props.w + Math.max(0, props.w - 1) * (props.margin)[0]));
          left = clamp(left, 0, rightBoundary);
        }
      }

      const newPosition1 = {top, left};
      // @ts-ignore
      setState(prevState => ({
        ...prevState,
        dragging: newPosition1,
      }));

      // Call callback with this data
      const {x, y} = calcXY(positionParams, top, left, props.w, props.h);
      props.onDrag.call(GridItem, props.i, x, y, {
        e: droppingPosition.e,
        node,
        newPosition1
      });
    }
  }, [])



  // This is the max possible width - doesn't go to infinity because of the width of the window
  const maxWidth = calcGridItemPosition(positionParams, 0, 0, props.cols, 0, {
    dragging: undefined,
    resizing: undefined
  }).width;

  // Calculate min/max constraints using our min & maxes
  const mins = calcGridItemPosition(positionParams, 0, 0, props.minW, props.minH, {
    dragging: undefined,
    resizing: undefined
  });
  const maxes = calcGridItemPosition(positionParams, 0, 0, props.maxW, props.maxH, {
    dragging: undefined,
    resizing: undefined
  });
  const newPosition: any = calcGridItemPosition(
          positionParams,
          props.x,
          props.y,
          props.w,
          props.h,
          state
  );

  let style;
  if (props.useCSSTransforms) {
    style = {
      transform: `translate(${(newPosition.left)}px,${(newPosition.top)}px)`,
      WebkitTransform: `translate(${(newPosition.left)}px,${(newPosition.top)}px)`,
      MozTransform: `translate(${(newPosition.left)}px,${(newPosition.top)}px)`,
      msTransform: `translate(${(newPosition.left)}px,${(newPosition.top)}px)`,
      OTransform: `translate(${(newPosition.left)}px,${(newPosition.top)}px)`,
      width: `${(newPosition.width)}px`,
      height: `${(newPosition.height)}px`,
      position: "absolute"
    };
  } else {
    // top,left (slow)
    style = {
      top: `${(newPosition.top)}px`,
      left: `${(newPosition.left)}px`,
      width: `${(newPosition.width)}px`,
      height: `${(newPosition.height)}px`,
      position: "absolute"
    };

    // This is used for server rendering.
    if (props.usePercentages) {
      style.left = newPosition.left / props.containerWidth * 100 + "%";
      style.width = newPosition.width / props.containerWidth * 100 + "%";
    }
  }

  function handleDragStart(node: HTMLElement, e: Event) {
    if (!props.onDragStart) return;

    const newPosition = {top: 0, left: 0};

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
            positionParams,
            newPosition.top,
            newPosition.left,
            props.w,
            props.h
    );

    return props.onDragStart.call(GridItem, props.i, x, y, {
      e,
      node,
      newPosition
    });
  }

  function handleDrag(deltaY: number, deltaX: number, node: HTMLElement, e: Event) {
    if (!props.onDrag) return;

    if (!state.dragging) {
      throw new Error("onDrag called before onDragStart.");
    }
    // @ts-ignore
    let top = state?.dragging?.top + deltaY;
    // @ts-ignore
    let left = state?.dragging?.left + deltaX;


    // Boundary calculations; keeps items within the grid
    if (props.isBounded) {

      if (node.offsetParent) {
        const rowHeight = (
                (props.containerHeight - (props.margin)[1] * (props.cols - 1) - (props.containerPadding)[1] * 2) / props.cols
        );
        const bottomBoundary =
                props.containerHeight - (!Number.isFinite(props.h) ? props.h : Math.round(rowHeight * props.h + Math.max(0, props.h - 1) * (props.margin)[1]));
        top = clamp(top, 0, bottomBoundary);

        const colWidth = (
                (props.containerWidth - (props.margin)[0] * (props.cols - 1) - (props.containerPadding)[0] * 2) / props.cols
        );
        const rightBoundary =
                props.containerWidth - (!Number.isFinite(props.w) ? props.w : Math.round(colWidth * props.w + Math.max(0, props.w - 1) * (props.margin)[0]));
        left = clamp(left, 0, rightBoundary);
      }
    }

    const newPosition = {top, left};
    // @ts-ignore
    setState(prevState => ({
      ...prevState,
      dragging: newPosition,
    }));

    // Call callback with this data
    const {x, y} = calcXY(positionParams, top, left, props.w, props.h);
    return props.onDrag.call(GridItem, props.i, x, y, {
      e,
      node,
      newPosition
    });
  }

  function handleDragStop(e: Event, node: HTMLElement) {
    if (!props.onDragStop) return;

    if (!state.dragging) {
      throw new Error("onDragEnd called before onDragStart.");
    }

    const newPosition = {top: state.dragging.top, left: state.dragging.left};
    setState(prevState => ({
      ...prevState,
      dragging: null,
    }));

    const {x, y} = calcXY(positionParams, state.dragging.top, state.dragging.left, props.w, props.h);

    return props.onDragStop.call(GridItem, props.i, x, y, {
      e,
      node,
      newPosition
    });
  }

  return (
          // @ts-ignore
          <DraggableCore
                  disabled={!props.isDraggable}
                  onStart={(e: Event, {node}: any) => {
                    return handleDragStart(node, e);
                  }}
                  onDrag={(
                          e: Event,
                          {node, deltaX, deltaY}: { node: any, deltaX: any, deltaY: any }
                  ) => {
                    return handleDrag(deltaY, deltaX, node, e);
                  }}
                  onStop={(e: Event, {node}: any) => {
                    return handleDragStop(e, node);
                  }}
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
                    minConstraints={[mins.width, mins.height]}
                    maxConstraints={[
                      Math.min(maxes.width, maxWidth),
                      Math.min(maxes.height, Infinity)
                    ]}
                    onResizeStop={(
                            e: Event,
                            callbackData: any
                    ) => {
                      if (!props.onResizeStop) return

                      const handleOrientation = ["sw", "w", "nw"].indexOf(callbackData.handle) != -1 ? "west" : "east";

                      // Get new XY
                      let {w, h} = calcWH(
                              positionParams,
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

                      props.onResizeStop.call(GridItem, props.i, w, h, {
                        e,
                        node: callbackData.node,
                        size: callbackData.size,
                        handle: callbackData.handle
                      });
                    }}
                    onResizeStart={(
                            e: Event,
                            callbackData: any
                    ) => {
                      const newPosition = {top: 0, left: 0};

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
                              positionParams,
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

                      props.onResizeStart.call(GridItem, props.i, w, h, {
                        e,
                        node: callbackData.node,
                        size: newPosition,
                        handle: props.handle
                      });
                    }}
                    onResize={(
                            e: Event,
                            callbackData: any
                    ) => {
                      if (!props.onResize) return

                      const handleOrientation = ["sw", "w", "nw"].indexOf(callbackData.handle) != -1 ? "west" : "east";

                      // Get new XY
                      let {w, h} = calcWH(
                              positionParams,
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
                            // console.log(callbackData)
                            callbackData.size.left = currentLeft - callbackData.size.deltaX;
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
                        callbackData.size.left = state.resizing + callbackData.size.deltaX
                        setState(prevState => ({
                          ...prevState,
                          resizing: callbackData.size,
                        }));
                      }

                      props.onResize.call(GridItem, props.i, w, h, {
                        e,
                        node: elem,
                        size: callbackData.size,
                        handle: callbackData.handle
                      });
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
                  ...style
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
