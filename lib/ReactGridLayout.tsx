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
import {bottom, compact, correctBounds, getAllCollisions, moveElement, synchronizeLayoutWithChildren} from "./utils";
import useSize from "./components/useSize";

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
const ReactGridLayout = (props: { layout?: any; children?: any; cols: any; onLayoutChange?: any; onDragStart?: any; preventCollision?: any; onDrag?: any; onDragStop?: any; onResizeStart?: any; onResize?: any; onResizeStop?: any; width?: any; height?: any; margin?: any; maxRows?: any; rowHeight?: any; useCSSTransforms?: any; transformScale?: any; isDraggable?: any; isResizable?: any; resizeHandles?: any; isBounded?: any; draggableCancel?: any; draggableHandle?: any; resizeHandle?: any; droppingItem?: any; onDrop?: any; autoSize?: any; containerPadding?: any; innerRef?: any; className?: any; style?: any; isDroppable?: any; }) => {

  const containerRef = React.useRef()
  const [{width, height: componentHeight}] = useSize(containerRef)

  // Generate one layout item per child.
  const layout: LayoutItem[] = [];
  React.Children.forEach(props.children, (child, i: number) => {
    // Don't overwrite if it already exists.
    if (props.layout.find(((value, index) => (props.layout)[index].i === String(child.key)))) {
      layout[i] = {
        ...props.layout.find(((value, index) => (props.layout)[index].i === String(child.key)))
      };
    } else {
      if (child.props["data-grid"] || child.props._grid) {
        // FIXME clone not really necessary here
        layout[i] = {
          ...(child.props["data-grid"] || child.props._grid),
          i: child.key
        };
      } else {
        // Nothing provided: ensure this is added to the bottom
        // FIXME clone not really necessary here
        layout[i] = {
          w: 1,
          h: 1,
          x: 0,
          y: bottom(layout),
          i: String(child.key)
        };
      }
    }
  });

  let syncedLayout = compact(correctBounds(layout, {cols: props.cols}), props.verticalCompact === false ? null : props.compactType, props.cols);

  const [state, setState] = React.useState({
    activeDrag: null,
    layout: syncedLayout,
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    droppingDOMNode: null,
    children: []
  })

  const [dragEnterCounter, setDragEnterCounter] = React.useState(0)

  const onLayoutMaybeChanged = (newLayout: Layout, oldLayout: Layout | null) => {
    if (!oldLayout) oldLayout = state.layout;

    if (!isEqual(oldLayout, newLayout)) {
      props.onLayoutChange(newLayout);
    }
  }

  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      mounted: true
    }));
    // // Possibly call back with layout on mount. This should be done after correcting the layout width
    // // to ensure we don't rerender with the wrong width.
    // onLayoutMaybeChanged(state.layout, props.layout);
  }, [])

  React.useEffect(() => {
    const newLayout = state.layout;
    const oldLayout = state.layout;

    if (!state.activeDrag) {
      onLayoutMaybeChanged(newLayout, oldLayout);
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
      } else {
        if (!isEqual(
                React.Children.map(props.children, c => c.key),
                React.Children.map(prevState.children, c => c.key)
        )) {
          // If children change, also regenerate the layout. Use our state
          // as the base in case because it may be more up to date than
          // what is in props.
          newLayoutBase = prevState.layout;
        }
      }

      // We need to regenerate the layout.
      if (newLayoutBase) {
        const newLayout = synchronizeLayoutWithChildren(
                newLayoutBase,
                props.children,
                props.cols,
                props.verticalCompact === false ? null : props.compactType
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


  let height;
  const nbRow = bottom(state.layout);
  // if (props.autoSize) {
  //   height = nbRow * props.rowHeight +
  //           props.margin[1] +
  //           props.containerPadding[1] +
  //           "px";
  // } else {
    height = componentHeight
  // }


  let gridItem = state.layout.find(((value, index) => (state.layout)[index].i === String(state.droppingDOMNode?.key)))
  let isDraggable = typeof gridItem?.isDraggable === "boolean"
          ? gridItem?.isDraggable
          : !gridItem?.static && props.isDraggable;
  let isResizable = typeof gridItem?.isResizable === "boolean"
          ? gridItem?.isResizable
          : !gridItem?.static && props.isResizable;
  let isBounded = (typeof gridItem?.isDraggable === "boolean"
          ? gridItem?.isDraggable
          : !gridItem?.static && props.isDraggable) && props.isBounded && gridItem?.isBounded !== false;
  let w = gridItem?.w;
  let h = gridItem?.h;
  let x = gridItem?.x;
  let y = gridItem?.y;
  let i = gridItem?.i;
  let minH = gridItem?.minH;
  let minW = gridItem?.minW;
  let maxH = gridItem?.maxH;
  let maxW = gridItem?.maxW;
  let isStatic = gridItem?.static;
  let resizeHandles = gridItem?.resizeHandles || props.resizeHandles;

  const onDragStop = (
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
    layout = moveElement(layout, l, x, y, isUserAction, preventCollision, props.verticalCompact === false ? null : props.compactType, cols);

    props.onDragStop(layout, oldDragItem, l, null, e, node);

    // Set state
    const newLayout = compact(layout, props.verticalCompact === false ? null : props.compactType, cols);
    const {oldLayout} = state;
    setState(prevState => ({
      ...prevState,
      activeDrag: null,
      layout: newLayout,
      oldDragItem: null,
      oldLayout: null
    }));

    // @ts-ignore
    onLayoutMaybeChanged(newLayout, oldLayout);
  };

  const onDragStart = (
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
  };

  const onDrag = (i: string, x: number, y: number, {e, node}: GridDragEvent): void => {
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
    layout = moveElement(layout, l, x, y, isUserAction, props.preventCollision, props.verticalCompact === false ? null : props.compactType, cols);

    props.onDrag(layout, oldDragItem, l, placeholder, e, node);

    // @ts-ignore
    setState(prevState => ({
      ...prevState,
      layout: compact(layout, props.verticalCompact === false ? null : props.compactType, cols),
      activeDrag: placeholder
    }));
  };

  const onResizeStart = (i: string, w: number, h: number, {
    e,
    node,
    handle
  }: GridResizeEvent) => {
    const l = state.layout.find(((value, index) => (state.layout)[index].i === i));
    if (!l) return;

    // @ts-ignore
    setState(prevState => ({
      ...prevState,
      oldResizeItem: {
        ...(l)
      },
      oldLayout: state.layout,
      resizing: true
    }));

    props.onResizeStart(state.layout, l, l, null, e, node);
  };

  const onResize = (i: string, w: number, h: number, {
    e,
    node,
    size,
    handle
  }: GridResizeEvent) => {

    let layout = state.layout
    let item = layout.find(((value, index) => layout[index].i === i));
    if (!item) return [layout, null];
    let la = {
      ...item
    };
    // Something like quad tree should be used
    // to find collisions faster
    let hasCollisions;
    if (props.preventCollision) {
      const collisions = getAllCollisions(state.layout, {...la, w, h}).filter(
              layoutItem => layoutItem.i !== la.i
      );
      hasCollisions = collisions.length > 0;

      // If we're colliding, we need adjust the placeholder.
      if (hasCollisions) {
        // adjust w && h to maximum allowed space
        let leastX = Infinity,
                leastY = Infinity;
        collisions.forEach(layoutItem => {
          if (layoutItem.x > la.x) leastX = Math.min(leastX, layoutItem.x);
          if (layoutItem.y > la.y) leastY = Math.min(leastY, layoutItem.y);
        });

        if (Number.isFinite(leastX)) la.w = leastX - la.x;
        if (Number.isFinite(leastY)) la.h = leastY - la.y;
      }
    }

    // if (!hasCollisions) {
    //   // Set new width and height.
    //   la.w = w;
    //   la.h = h;
    // }

    item = la
    let indexToModify = layout.findIndex((v, i) => v.i === item.i)
    layout[indexToModify] = item

    let [newLayout, l] = [layout, item];

    let finalLayout;
    if (["sw", "w", "nw", "n", "ne"].indexOf(handle) !== -1) {
      let x = l.x;
      let y = l.y;
      if (["sw", "nw", "w"].indexOf(handle) !== -1) {
        x = l.x + (l.w - w);
        x = x < 0 ? 0 : x;
      }

      if (["ne", "n", "nw"].indexOf(handle) !== -1) {
        y = l.y + (l.h - h);
        y = y < 0 ? 0 : y;
      }

      l.w = w;
      l.h = h;
      // Move the element to the new position.
      const isUserAction = true;
      finalLayout = moveElement(
              newLayout,
              l,
              x,
              y,
              isUserAction,
              props.preventCollision,
              props.verticalCompact === false ? null : props.compactType,
              props.cols
      );
    } else {
      l.w = w;
      l.h = h;
      finalLayout = newLayout
    }

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

    props.onResize(finalLayout, state.oldResizeItem, l, placeholder, e, node);

    // Re-compact the newLayout and set the drag placeholder.
    // @ts-ignore
    // @ts-ignore
    setState(prevState => ({
      ...prevState,
      layout: compact(finalLayout, props.verticalCompact === false ? null : props.compactType, props.cols),
      activeDrag: placeholder
    }));
  };

  const onResizeStop = (i: string, w: number, h: number, {
    e,
    node,
    handle
  }: GridResizeEvent) => {
    const {layout, oldResizeItem} = state;
    const {cols} = props;
    const l = layout.find(((value, index) => layout[index].i === i));

    props.onResizeStop(layout, oldResizeItem, l, null, e, node);

    // Set state
    const newLayout = compact(layout, props.verticalCompact === false ? null : props.compactType, cols);
    const {oldLayout} = state;
    setState(prevState => ({
      ...prevState,
      activeDrag: null,
      layout: newLayout,
      oldResizeItem: null,
      oldLayout: null,
      resizing: false
    }));

    onLayoutMaybeChanged(newLayout, oldLayout);
  };


  const onDrop = props.isDroppable ? (e: Event) => {
    const item = state.layout.find(l => l.i === props.droppingItem.i);

    // reset dragEnter counter on drop
    setDragEnterCounter(0);

    const newLayout = compact(
            state.layout.filter(l => l.i !== props.droppingItem.i),
            props.verticalCompact === false ? null : props.compactType,
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
  };

  const onDragLeave = props.isDroppable ? () => {
    setDragEnterCounter(prevState => prevState--)

    // onDragLeave can be triggered on each layout's child.
    // But we know that count of dragEnter and dragLeave events
    // will be balanced after leaving the layout's container
    // so we can increase and decrease count of dragEnter and
    // when it'll be equal to 0 we'll remove the placeholder
    if (dragEnterCounter === 0) {
      const newLayout = compact(
              state.layout.filter(l => l.i !== props.droppingItem.i),
              props.verticalCompact === false ? null : props.compactType,
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
  };

  const onDragEnter = props.isDroppable ? () => {
    setDragEnterCounter(prevState => prevState++);
  } : () => {
  };

  const onDragOver = props.isDroppable ? (e: { nativeEvent: { target?: any; layerX?: any; layerY?: any; }; preventDefault: () => void; stopPropagation: () => void; }) => {
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
        containerWidth: width,
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
  };

  return (
          <div
                  ref={containerRef}
                  style={{
                    height: `100%`,
                    width: `100%`
                  }}>
            <div
                    ref={props.innerRef}
                    className={classNames(layoutClassName, props.className)}
                    style={{
                      height: height,
                      ...props.style
                    }}
                    // @ts-ignore
                    onDrop={onDrop}
                    onDragLeave={onDragLeave}
                    onDragEnter={onDragEnter}
                    onDragOver={onDragOver}
            >
              {React.Children.map(props.children, child => {
                        const gridItem = state.layout.find(((value, index) => (state.layout)[index].i === String(child.key)))
                        return (child && child.key && gridItem) && (
                                <GridItem
                                        layout={state.layout}
                                        nbRows={nbRow}
                                        containerWidth={width}
                                        containerHeight={props.height}
                                        cols={props.cols}
                                        margin={props.margin}
                                        containerPadding={props.containerPadding}
                                        maxRows={props.maxRows}
                                        rowHeight={props.rowHeight}
                                        cancel={props.draggableCancel}
                                        handle={props.draggableHandle}
                                        onDragStop={onDragStop}
                                        onDragStart={onDragStart}
                                        onDrag={onDrag}
                                        onResizeStart={onResizeStart}
                                        onResize={onResize}
                                        onResizeStop={onResizeStop}
                                        isDraggable={typeof gridItem?.isDraggable === "boolean"
                                                ? gridItem?.isDraggable
                                                : !gridItem?.static && props.isDraggable}
                                        isResizable={typeof gridItem?.isResizable === "boolean"
                                                ? gridItem?.isResizable
                                                : !gridItem?.static && props.isResizable}
                                        isBounded={(typeof gridItem?.isDraggable === "boolean"
                                                ? gridItem?.isDraggable
                                                : !gridItem?.static && props.isDraggable) && props.isBounded && gridItem?.isBounded !== false}
                                        useCSSTransforms={props.useCSSTransforms && state.mounted}
                                        usePercentages={!state.mounted}
                                        transformScale={props.transformScale}
                                        w={gridItem?.w}
                                        h={gridItem?.h}
                                        x={gridItem?.x}
                                        y={gridItem?.y}
                                        i={gridItem?.i}
                                        minH={gridItem?.minH}
                                        minW={gridItem?.minW}
                                        maxH={gridItem?.maxH}
                                        maxW={gridItem?.maxW}
                                        static={gridItem?.static}
                                        resizeHandles={gridItem?.resizeHandles || props.resizeHandles}
                                        resizeHandle={props.resizeHandle}
                                        activeDrag={state.activeDrag ?? null}
                                >
                                  {child}
                                </GridItem>
                        );
                      }
              )}
              {props.isDroppable &&
              state.droppingDOMNode?.key &&
              gridItem && (
                      <GridItem
                              layout={state.layout}
                              nbRows={nbRow}
                              containerWidth={width}
                              containerHeight={props.height}
                              cols={props.cols}
                              margin={props.margin}
                              containerPadding={props.containerPadding}
                              maxRows={props.maxRows}
                              rowHeight={props.rowHeight}
                              cancel={props.draggableCancel}
                              handle={props.draggableHandle}
                              onDragStop={onDragStop}
                              onDragStart={onDragStart}
                              onDrag={onDrag}
                              onResizeStart={onResizeStart}
                              onResize={onResizeStart}
                              onResizeStop={onResizeStop}
                              isDraggable={isDraggable}
                              isResizable={isResizable}
                              isBounded={isBounded}
                              useCSSTransforms={props.useCSSTransforms && state.mounted}
                              usePercentages={!state.mounted}
                              transformScale={props.transformScale}
                              w={w}
                              h={h}
                              x={x}
                              y={y}
                              i={i}
                              minH={minH}
                              minW={minW}
                              maxH={maxH}
                              maxW={maxW}
                              static={isStatic}
                              droppingPosition={state.droppingPosition}
                              resizeHandles={resizeHandles}
                              resizeHandle={props.resizeHandle}
                      >
                        {state.droppingDOMNode}
                      </GridItem>
              )}
              {state.activeDrag && (
                      <GridItem
                              layout={state.layout}
                              nbRows={nbRow}
                              w={state.activeDrag?.w}
                              h={state.activeDrag?.h}
                              x={state.activeDrag?.x}
                              y={state.activeDrag?.y}
                              i={state.activeDrag?.i}
                              className={classNames("react-grid-placeholder", {
                                "placeholder-resizing": Boolean(state.resizing)
                              })}
                              containerWidth={width}
                              containerHeight={props.height}
                              cols={props.cols}
                              margin={props.margin}
                              containerPadding={props.containerPadding}
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
          </div>
  );
}

ReactGridLayout.defaultProps = {
  autoSize: false,
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
