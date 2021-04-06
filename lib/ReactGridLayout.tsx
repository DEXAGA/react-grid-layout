// @ts-ignore
import classNames from "classnames";

// @ts-ignore
import isEqual from "lodash.isequal";
// @ts-ignore
import type {ChildrenArray as ReactChildrenArray, Element as ReactElement} from "react";
import * as React from "react";

import type {PositionParams} from "./calculateUtils";
import {calcXY} from "./calculateUtils";

import GridItem from "./GridItem";
// Types
import type {CompactType, DroppingPosition, GridDragEvent, GridResizeEvent, Layout, LayoutItem} from "./utils";
import {
  bottom,
  childrenEqual,
  compact,
  compactType,
  getAllCollisions,
  moveElement,
  synchronizeLayoutWithChildren,
  withLayoutItem
} from "./utils";

type State = {
  activeDrag: LayoutItem,
  layout: Layout,
  mounted: boolean,
  oldDragItem: LayoutItem,
  oldLayout: Layout,
  oldResizeItem: LayoutItem,
  droppingDOMNode: ReactElement<any>,
  droppingPosition?: DroppingPosition,
  // Mirrored props
  children: ReactChildrenArray<ReactElement<any>>,
  compactType?: CompactType,
  propsLayout?: Layout
};

// End Types

const layoutClassName = "react-grid-layout";
let isFirefox = false;
// Try...catch will protect from navigator not existing (e.g. node) or a bad implementation of navigator
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch (e) {
  /* Ignore */
}

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */

const ReactGridLayout = (props: { layout?: any; children?: any; cols: any; onLayoutChange?: any; onDragStart?: any; preventCollision?: any; onDrag?: any; onDragStop?: any; onResizeStart?: any; onResize?: any; onResizeStop?: any; width?: any; height?: any; margin?: any; maxRows?: any; rowHeight?: any; useCSSTransforms?: any; transformScale?: any; isDraggable?: any; isResizable?: any; resizeHandles?: any; isBounded?: any; draggableCancel?: any; draggableHandle?: any; resizeHandle?: any; droppingItem?: any; onDrop?: any; autoSize?: any; containerPadding?: any; innerRef?: any; className?: any; style?: any; isDroppable?: any; }) => {

  const initialState = {
    activeDrag: null,
    layout: synchronizeLayoutWithChildren(
            props.layout,
            props.children,
            props.cols,
            // Legacy support for verticalCompact: false
            compactType(props)
    ),
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    droppingDOMNode: null,
    children: []
  };

  const [state, setState] = React.useState(initialState)

  const [dragEnterCounter, setDragEnterCounter] = React.useState(0)

  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      mounted: true
    }));
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    props.onLayoutChange(state.layout);
  }, [])

  React.useEffect(() => {
    if (!state.activeDrag) {
      props.onLayoutChange(state.layout);
    }
  })

  React.useEffect(() => {
    setState(prevState => {
      let newLayoutBase;

      if (prevState.activeDrag) {
        return prevState
      }

      // Legacy support for compactType
      // Allow parent to set layout directly.
      if (
              !isEqual(props.layout, prevState.propsLayout) ||
              props.compactType !== prevState.compactType
      ) {
        newLayoutBase = props.layout;
      } else if (!childrenEqual(props.children, prevState.children)) {
        // If children change, also regenerate the layout. Use our state
        // as the base in case because it may be more up to date than
        // what is in props.
        newLayoutBase = prevState.layout;
      }

      // We need to regenerate the layout.
      if (newLayoutBase) {
        const newLayout = synchronizeLayoutWithChildren(
                newLayoutBase,
                props.children,
                props.cols,
                compactType(props)
        );

        return {
          ...prevState,
          layout: newLayout,
          // We need to save these props to state for using
          // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
          compactType: props.compactType,
          children: props.children,
          propsLayout: props.layout
        };
      } else {
        return prevState
      }

    })
  })

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  const containerHeight = () => {
    if (!props.autoSize) return;
    const nbRow = bottom(state.layout);
    const height = nbRow * props.rowHeight +
            props.margin[1] +
            props.containerPadding[1] +
            "px";
    return height !== undefined && height !== null ? height : props.height;
  }

  // console.log(props.height)

  return (
          <div
                  ref={props.innerRef}
                  className={classNames(layoutClassName, props.className)}
                  style={Object.assign(
                          {height: containerHeight()},
                          props.style
                  )}
                  // @ts-ignore
                  onDrop={props.isDroppable ? (e: Event) => {
                    const item = state.layout.find(l => l.i === props.droppingItem.i);

                    // reset dragEnter counter on drop
                    setDragEnterCounter(0);

                    const newLayout = compact(
                            state.layout.filter(l => l.i !== props.droppingItem.i),
                            compactType(props),
                            props.cols
                    );

                    setState(prevState => ({
                      ...prevState,
                      layout: newLayout,
                      droppingDOMNode: null,
                      activeDrag: null,
                      droppingPosition: undefined
                    }));

                    props.onDrop(state.layout, item, e);
                  } : () => {
                  }}
                  onDragLeave={props.isDroppable ? () => {
                    setDragEnterCounter(prevState => prevState--)

                    // onDragLeave can be triggered on each layout's child.
                    // But we know that count of dragEnter and dragLeave events
                    // will be balanced after leaving the layout's container
                    // so we can increase and decrease count of dragEnter and
                    // when it'll be equal to 0 we'll remove the placeholder
                    if (dragEnterCounter === 0) {
                      const newLayout = compact(
                              state.layout.filter(l => l.i !== props.droppingItem.i),
                              compactType(props),
                              props.cols
                      );

                      setState(prevState => ({
                        ...prevState,
                        layout: newLayout,
                        droppingDOMNode: null,
                        activeDrag: null,
                        droppingPosition: undefined
                      }));
                    }
                  } : () => {
                  }}
                  onDragEnter={props.isDroppable ? () => {
                    setDragEnterCounter(prevState => prevState++);
                  } : () => {
                  }}
                  onDragOver={props.isDroppable ? (e: { nativeEvent: { target?: any; layerX?: any; layerY?: any; }; preventDefault: () => void; stopPropagation: () => void; }) => {
                    // we should ignore events from layout's children in Firefox
                    // to avoid unpredictable jumping of a dropping placeholder
                    // FIXME remove this hack
                    if (
                            isFirefox &&
                            // $FlowIgnore can't figure this out
                            !e.nativeEvent.target?.classList.contains(layoutClassName)
                    ) {
                      // without this Firefox will not allow drop if currently over droppingItem
                      e.preventDefault();
                      return false;
                    }

                    const {layout} = state;
                    // This is relative to the DOM element that this event fired for.
                    const {layerX, layerY} = e.nativeEvent;
                    const droppingPosition = {left: layerX, top: layerY, e};

                    // @ts-ignore
                    const {droppingPosition: droppingPosition1, droppingDOMNode} = state;
                    if (!droppingDOMNode) {
                      const positionParams: PositionParams = {
                        cols: props.cols,
                        margin: props.margin,
                        maxRows: props.maxRows,
                        rowHeight: props.rowHeight,
                        // @ts-ignore
                        containerWidth: props.width,
                        containerHeight: props.height,
                        containerPadding: props.margin
                      };

                      const calculatedPosition = calcXY(
                              positionParams,
                              layerY,
                              layerX,
                              props.droppingItem.w,
                              props.droppingItem.h
                      );

                      // @ts-ignore
                      setState(prevState => ({
                        ...prevState,
                        droppingDOMNode: <div key={props.droppingItem.i}/>,
                        droppingPosition,
                        layout: [
                          ...layout,
                          {
                            ...props.droppingItem,
                            x: calculatedPosition.x,
                            y: calculatedPosition.y,
                            static: false,
                            isDraggable: true
                          }
                        ]
                      }));
                    } else if (droppingPosition1) {
                      const {left, top} = droppingPosition1;
                      const shouldUpdatePosition = left != layerX || top != layerY;
                      if (shouldUpdatePosition) {
                        setState(prevState => ({
                          ...prevState,
                          droppingPosition
                        }));
                      }
                    }

                    e.stopPropagation();
                    e.preventDefault();
                  } : () => {
                  }}
          >
            {React.Children.map(props.children, child => {
                      return (child && child.key && state.layout.find(((value, index) => (state.layout)[index].i === String(child.key)))) && (
                              <GridItem
                                      containerWidth={props.width}
                                      containerHeight={props.height}
                                      cols={props.cols}
                                      margin={props.margin}
                                      containerPadding={props.margin}
                                      maxRows={props.maxRows}
                                      rowHeight={props.rowHeight}
                                      cancel={props.draggableCancel}
                                      handle={props.draggableHandle}
                                      onDragStop={(
                                              i: string,
                                              x: number,
                                              y: number,
                                              {e, node}: GridDragEvent
                                      ): void => {
                                        if (!state.activeDrag) return;

                                        const {oldDragItem} = state;
                                        let {layout} = state;
                                        const {cols, preventCollision} = props;
                                        const l = layout.find(((value, index) => layout[index].i === i));
                                        if (!l) return;

                                        // Move the element here
                                        const isUserAction = true;
                                        layout = moveElement(layout, l, x, y, isUserAction, preventCollision, compactType(props), cols);

                                        props.onDragStop(layout, oldDragItem, l, null, e, node);

                                        // Set state
                                        const newLayout = compact(layout, compactType(props), cols);
                                        const {oldLayout} = state;
                                        setState(prevState => ({
                                          ...prevState,
                                          activeDrag: null,
                                          layout: newLayout,
                                          oldDragItem: null,
                                          oldLayout: null
                                        }));

                                        // @ts-ignore
                                        props.onLayoutChange(newLayout);
                                      }}
                                      onDragStart={(
                                              i: string,
                                              x: number,
                                              y: number,
                                              {e, node}: GridDragEvent
                                      ): void => {
                                        const {layout} = state;
                                        const l = layout.find(((value, index) => layout[index].i === i));
                                        if (!l) return;

                                        // @ts-ignore
                                        setState(prevState => ({
                                          ...prevState,
                                          oldDragItem: {
                                            ...(l)
                                          },
                                          oldLayout: state.layout
                                        }));

                                        return props.onDragStart(layout, l, l, null, e, node);
                                      }}
                                      onDrag={(i: string, x: number, y: number, {e, node}: GridDragEvent): void => {
                                        const {oldDragItem} = state;
                                        let {layout} = state;
                                        const {cols} = props;
                                        const l = layout.find(((value, index) => layout[index].i === i));
                                        if (!l) return;

                                        // Create placeholder (display only)
                                        const placeholder = {
                                          w: l.w,
                                          h: l.h,
                                          x: l.x,
                                          y: l.y,
                                          placeholder: true,
                                          i: i
                                        };

                                        // Move the element to the dragged location.
                                        const isUserAction = true;
                                        layout = moveElement(layout, l, x, y, isUserAction, props.preventCollision, compactType(props), cols);

                                        props.onDrag(layout, oldDragItem, l, placeholder, e, node);

                                        // @ts-ignore
                                        setState(prevState => ({
                                          ...prevState,
                                          layout: compact(layout, compactType(props), cols),
                                          activeDrag: placeholder
                                        }));
                                      }}
                                      onResizeStart={(i: string, w: number, h: number, {e, node}: GridResizeEvent) => {
                                        const l = state.layout.find(((value, index) => (state.layout)[index].i === i));
                                        if (!l) return;

                                        // @ts-ignore
                                        setState(prevState => ({
                                          ...prevState,
                                          oldResizeItem: {
                                            ...(l)
                                          },
                                          oldLayout: state.layout
                                        }));

                                        props.onResizeStart(state.layout, l, l, null, e, node);
                                      }}
                                      onResize={(i: string, w: number, h: number, {e, node}: GridResizeEvent) => {

                                        const [newLayout, l] = withLayoutItem(state.layout, i, (l: { i: any; x: any; y: any; w: any; h: any; minW?: number | undefined; minH?: number | undefined; maxW?: number | undefined; maxH?: number | undefined; moved?: boolean | undefined; static?: boolean | undefined; isDraggable?: boolean | undefined; isResizable?: boolean | undefined; resizeHandles?: ("s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne")[] | undefined; isBounded?: boolean | undefined; }) => {
                                          // Something like quad tree should be used
                                          // to find collisions faster
                                          let hasCollisions;
                                          if (props.preventCollision) {
                                            const collisions = getAllCollisions(state.layout, {...l, w, h}).filter(
                                                    layoutItem => layoutItem.i !== l.i
                                            );
                                            hasCollisions = collisions.length > 0;

                                            // If we're colliding, we need adjust the placeholder.
                                            if (hasCollisions) {
                                              // adjust w && h to maximum allowed space
                                              let leastX = Infinity,
                                                      leastY = Infinity;
                                              collisions.forEach(layoutItem => {
                                                if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
                                                if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
                                              });

                                              if (Number.isFinite(leastX)) l.w = leastX - l.x;
                                              if (Number.isFinite(leastY)) l.h = leastY - l.y;
                                            }
                                          }

                                          if (!hasCollisions) {
                                            // Set new width and height.
                                            l.w = w;
                                            l.h = h;
                                          }

                                          return l;
                                        });

                                        // Shouldn't ever happen, but typechecking makes it necessary
                                        if (!l) return;

                                        // Create placeholder element (display only)
                                        let placeholder: { static: boolean; w: any; h: any; x: any; y: any; i: string };
                                        placeholder = {
                                          // @ts-ignore
                                          "w": l.w,
                                          // @ts-ignore
                                          "h": l.h,
                                          // @ts-ignore
                                          "x": l.x,
                                          // @ts-ignore
                                          "y": l.y,
                                          "static": true,
                                          "i": i
                                        };

                                        props.onResize(newLayout, state.oldResizeItem, l, placeholder, e, node);

                                        // Re-compact the newLayout and set the drag placeholder.
                                        // @ts-ignore
                                        // @ts-ignore
                                        setState(prevState => ({
                                          ...prevState,
                                          layout: compact(newLayout, compactType(props), props.cols),
                                          activeDrag: placeholder
                                        }));
                                      }}
                                      onResizeStop={(i: string, w: number, h: number, {e, node}: GridResizeEvent) => {
                                        const {layout, oldResizeItem} = state;
                                        const {cols} = props;
                                        const l = layout.find(((value, index) => layout[index].i === i));

                                        props.onResizeStop(layout, oldResizeItem, l, null, e, node);

                                        // Set state
                                        const newLayout = compact(layout, compactType(props), cols);
                                        const {oldLayout} = state;
                                        setState(prevState => ({
                                          ...prevState,
                                          activeDrag: null,
                                          layout: newLayout,
                                          oldResizeItem: null,
                                          oldLayout: null
                                        }));

                                        props.onLayoutChange(newLayout);
                                      }}
                                      isDraggable={typeof state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isDraggable === "boolean"
                                              ? state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isDraggable
                                              : !state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).static && props.isDraggable}
                                      isResizable={typeof state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isResizable === "boolean"
                                              ? state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isResizable
                                              : !state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).static && props.isResizable}
                                      isBounded={(typeof state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isDraggable === "boolean"
                                              ? state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isDraggable
                                              : !state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).static && props.isDraggable) && props.isBounded && state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).isBounded !== false}
                                      useCSSTransforms={props.useCSSTransforms && state.mounted}
                                      usePercentages={!state.mounted}
                                      transformScale={props.transformScale}
                                      w={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).w}
                                      h={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).h}
                                      x={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).x}
                                      y={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).y}
                                      i={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).i}
                                      minH={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).minH}
                                      minW={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).minW}
                                      maxH={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).maxH}
                                      maxW={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).maxW}
                                      static={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).static}
                                      droppingPosition={false ? state.droppingPosition : undefined}
                                      resizeHandles={state.layout.find(((value, index) => (state.layout)[index].i === String(child.key))).resizeHandles || props.resizeHandles}
                                      resizeHandle={props.resizeHandle}
                              >
                                {child}
                              </GridItem>
                      );
                    }
            )}
            {props.isDroppable &&
            state.droppingDOMNode &&
            state.droppingDOMNode &&
            state.droppingDOMNode.key &&
            state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))) && (
                    <GridItem
                            containerWidth={props.width}
                            containerHeight={props.height}
                            cols={props.cols}
                            margin={props.margin}
                            containerPadding={props.margin}
                            maxRows={props.maxRows}
                            rowHeight={props.rowHeight}
                            cancel={props.draggableCancel}
                            handle={props.draggableHandle}
                            onDragStop={(
                                    i: string,
                                    x: number,
                                    y: number,
                                    {e, node}: GridDragEvent
                            ): void => {
                              if (!state.activeDrag) return;

                              const {oldDragItem} = state;
                              let {layout} = state;
                              const {cols, preventCollision} = props;
                              const l = layout.find(((value, index) => layout[index].i === i));
                              if (!l) return;

                              // Move the element here
                              const isUserAction = true;
                              layout = moveElement(layout, l, x, y, isUserAction, preventCollision, compactType(props), cols);

                              props.onDragStop(layout, oldDragItem, l, null, e, node);

                              // Set state
                              const newLayout = compact(layout, compactType(props), cols);
                              const {oldLayout} = state;
                              setState(prevState => ({
                                ...prevState,
                                activeDrag: null,
                                layout: newLayout,
                                oldDragItem: null,
                                oldLayout: null
                              }));

                              // @ts-ignore
                              props.onLayoutChange(newLayout);
                            }}
                            onDragStart={(
                                    i: string,
                                    x: number,
                                    y: number,
                                    {e, node}: GridDragEvent
                            ): void => {
                              const {layout} = state;
                              const l = layout.find(((value, index) => layout[index].i === i));
                              if (!l) return;

                              // @ts-ignore
                              setState(prevState => ({
                                ...prevState,
                                oldDragItem: {
                                  ...(l)
                                },
                                oldLayout: state.layout
                              }));

                              return props.onDragStart(layout, l, l, null, e, node);
                            }}
                            onDrag={(i: string, x: number, y: number, {e, node}: GridDragEvent): void => {
                              const {oldDragItem} = state;
                              let {layout} = state;
                              const {cols} = props;
                              const l = layout.find(((value, index) => layout[index].i === i));
                              if (!l) return;

                              // Create placeholder (display only)
                              const placeholder = {
                                w: l.w,
                                h: l.h,
                                x: l.x,
                                y: l.y,
                                placeholder: true,
                                i: i
                              };

                              // Move the element to the dragged location.
                              const isUserAction = true;
                              layout = moveElement(layout, l, x, y, isUserAction, props.preventCollision, compactType(props), cols);

                              props.onDrag(layout, oldDragItem, l, placeholder, e, node);

                              // @ts-ignore
                              setState(prevState => ({
                                ...prevState,
                                layout: compact(layout, compactType(props), cols),
                                activeDrag: placeholder
                              }));
                            }}
                            onResizeStart={(i: string, w: number, h: number, {e, node}: GridResizeEvent) => {
                              const l = state.layout.find(((value, index) => (state.layout)[index].i === i));
                              if (!l) return;

                              // @ts-ignore
                              setState(prevState => ({
                                ...prevState,
                                oldResizeItem: {
                                  ...(l)
                                },
                                oldLayout: state.layout
                              }));

                              props.onResizeStart(state.layout, l, l, null, e, node);
                            }}
                            onResize={(i: string, w: number, h: number, {e, node}: GridResizeEvent) => {

                              const [newLayout, l] = withLayoutItem(state.layout, i, (l: { i: any; x: any; y: any; w: any; h: any; minW?: number | undefined; minH?: number | undefined; maxW?: number | undefined; maxH?: number | undefined; moved?: boolean | undefined; static?: boolean | undefined; isDraggable?: boolean | undefined; isResizable?: boolean | undefined; resizeHandles?: ("s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne")[] | undefined; isBounded?: boolean | undefined; }) => {
                                // Something like quad tree should be used
                                // to find collisions faster
                                let hasCollisions;
                                if (props.preventCollision) {
                                  const collisions = getAllCollisions(state.layout, {...l, w, h}).filter(
                                          layoutItem => layoutItem.i !== l.i
                                  );
                                  hasCollisions = collisions.length > 0;

                                  // If we're colliding, we need adjust the placeholder.
                                  if (hasCollisions) {
                                    // adjust w && h to maximum allowed space
                                    let leastX = Infinity,
                                            leastY = Infinity;
                                    collisions.forEach(layoutItem => {
                                      if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
                                      if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
                                    });

                                    if (Number.isFinite(leastX)) l.w = leastX - l.x;
                                    if (Number.isFinite(leastY)) l.h = leastY - l.y;
                                  }
                                }

                                if (!hasCollisions) {
                                  // Set new width and height.
                                  l.w = w;
                                  l.h = h;
                                }

                                return l;
                              });

                              // Shouldn't ever happen, but typechecking makes it necessary
                              if (!l) return;

                              // Create placeholder element (display only)
                              let placeholder: { static: boolean; w: any; h: any; x: any; y: any; i: string };
                              placeholder = {
                                // @ts-ignore
                                "w": l.w,
                                // @ts-ignore
                                "h": l.h,
                                // @ts-ignore
                                "x": l.x,
                                // @ts-ignore
                                "y": l.y,
                                "static": true,
                                "i": i
                              };

                              props.onResize(newLayout, state.oldResizeItem, l, placeholder, e, node);

                              // Re-compact the newLayout and set the drag placeholder.
                              // @ts-ignore
                              // @ts-ignore
                              setState(prevState => ({
                                ...prevState,
                                layout: compact(newLayout, compactType(props), props.cols),
                                activeDrag: placeholder
                              }));
                            }}
                            onResizeStop={(i: string, w: number, h: number, {e, node}: GridResizeEvent) => {
                              const {layout, oldResizeItem} = state;
                              const {cols} = props;
                              const l = layout.find(((value, index) => layout[index].i === i));

                              props.onResizeStop(layout, oldResizeItem, l, null, e, node);

                              // Set state
                              const newLayout = compact(layout, compactType(props), cols);
                              const {oldLayout} = state;
                              setState(prevState => ({
                                ...prevState,
                                activeDrag: null,
                                layout: newLayout,
                                oldResizeItem: null,
                                oldLayout: null
                              }));

                              props.onLayoutChange(newLayout);
                            }}
                            isDraggable={typeof state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isDraggable === "boolean"
                                    ? state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isDraggable
                                    : !state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).static && props.isDraggable}
                            isResizable={typeof state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isResizable === "boolean"
                                    ? state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isResizable
                                    : !state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).static && props.isResizable}
                            isBounded={(typeof state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isDraggable === "boolean"
                                    ? state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isDraggable
                                    : !state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).static && props.isDraggable) && props.isBounded && state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).isBounded !== false}
                            useCSSTransforms={props.useCSSTransforms && state.mounted}
                            usePercentages={!state.mounted}
                            transformScale={props.transformScale}
                            w={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).w}
                            h={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).h}
                            x={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).x}
                            y={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).y}
                            i={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).i}
                            minH={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).minH}
                            minW={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).minW}
                            maxH={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).maxH}
                            maxW={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).maxW}
                            static={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).static}
                            droppingPosition={true ? state.droppingPosition : undefined}
                            resizeHandles={state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode.key))).resizeHandles || props.resizeHandles}
                            resizeHandle={props.resizeHandle}
                    >
                      {state.droppingDOMNode}
                    </GridItem>
            )}
            {state.activeDrag && (
                    <GridItem
                            w={state.activeDrag?.w}
                            h={state.activeDrag?.h}
                            x={state.activeDrag?.x}
                            y={state.activeDrag?.y}
                            i={state.activeDrag?.i}
                            className="react-grid-placeholder"
                            containerWidth={props.width}
                            containerHeight={props.height}
                            cols={props.cols}
                            margin={props.margin}
                            containerPadding={props.margin}
                            maxRows={props.maxRows}
                            rowHeight={props.rowHeight}
                            isDraggable={false}
                            isResizable={false}
                            isBounded={false}
                            useCSSTransforms={props.useCSSTransforms}
                            transformScale={props.transformScale}
                    >
                      <div/>
                    </GridItem>
            )}
          </div>
  );
}

ReactGridLayout.defaultProps = {
  autoSize: true,
  cols: 12,
  className: "",
  style: {},
  draggableHandle: "",
  draggableCancel: "",
  containerPadding: [10, 10],
  height: 300,
  rowHeight: 150,
  maxRows: Infinity, // infinite vertical growth
  layout: [],
  margin: [10, 10],
  isBounded: false,
  isDraggable: true,
  isResizable: true,
  isDroppable: false,
  useCSSTransforms: true,
  transformScale: 1,
  verticalCompact: true,
  compactType: "vertical",
  preventCollision: false,
  droppingItem: {
    i: "__dropping-elem__",
    h: 1,
    w: 1
  },
  resizeHandles: ["se"],
  onLayoutChange: () => {
  },
  onDragStart: () => {
  },
  onDrag: () => {
  },
  onDragStop: () => {
  },
  onResizeStart: () => {
  },
  onResize: () => {
  },
  onResizeStop: () => {
  },
  onDrop: () => {
  }
}

export default ReactGridLayout
