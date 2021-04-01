// @flow
import classNames from "classnames";

import isEqual from "lodash.isequal";
import type {ChildrenArray as ReactChildrenArray, Element as ReactElement} from "react";
import * as React from "react";

import type {PositionParams} from "./calculateUtils";
import {calcXY} from "./calculateUtils";

import GridItem from "./GridItem";
// Types
import type {
  CompactType,
  DragOverEvent,
  DroppingPosition,
  GridDragEvent,
  GridResizeEvent,
  Layout,
  LayoutItem
} from "./utils";
import {
  bottom,
  cloneLayoutItem,
  compact,
  compactType,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  noop,
  synchronizeLayoutWithChildren,
  withLayoutItem
} from "./utils";

type State = {
  activeDrag:  LayoutItem,
  layout: Layout,
  mounted: boolean,
  oldDragItem:  LayoutItem,
  oldLayout:  Layout,
  oldResizeItem:  LayoutItem,
  droppingDOMNode:  ReactElement<any>,
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

const ReactGridLayout = (props) => {

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
  React.useEffect(() => {
    setState(prevState => Object.assign(prevState, initialState))
  }, [])


  const dragEnterCounter = 0;

  const onLayoutMaybeChanged = (newLayout: Layout, oldLayout:  Layout) => {
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
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    onLayoutMaybeChanged(state.layout, props.layout);
  }, [])

  React.useEffect(() => {
    if (!state.activeDrag) {
      const newLayout = state.layout;
      const oldLayout = state.layout;

      onLayoutMaybeChanged(newLayout, oldLayout);
    }
  })


  // static getDerivedStateFromProps(
  //   nextProps: Props,
  //   prevState: State
  // ): $Shape<State> | null {
  //   let newLayoutBase;
  //
  //   if (prevState.activeDrag) {
  //     return null;
  //   }
  //
  //   // Legacy support for compactType
  //   // Allow parent to set layout directly.
  //   if (
  //     !isEqual(nextProps.layout, prevState.propsLayout) ||
  //     nextProps.compactType !== prevState.compactType
  //   ) {
  //     newLayoutBase = nextProps.layout;
  //   } else if (!childrenEqual(nextProps.children, prevState.children)) {
  //     // If children change, also regenerate the layout. Use our state
  //     // as the base in case because it may be more up to date than
  //     // what is in props.
  //     newLayoutBase = prevState.layout;
  //   }
  //
  //   // We need to regenerate the layout.
  //   if (newLayoutBase) {
  //     const newLayout = synchronizeLayoutWithChildren(
  //       newLayoutBase,
  //       nextProps.children,
  //       nextProps.cols,
  //       compactType(nextProps)
  //     );
  //
  //     return {
  //       layout: newLayout,
  //       // We need to save these props to state for using
  //       // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
  //       compactType: nextProps.compactType,
  //       children: nextProps.children,
  //       propsLayout: nextProps.layout
  //     };
  //   }
  //
  //   return null;
  // }

  // shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
  //   return (
  //     // NOTE: this is almost always unequal. Therefore the only way to get better performance
  //     // from SCU is if the user intentionally memoizes children. If they do, and they can
  //     // handle changes properly, performance will increase.
  //     props.children !== nextProps.children ||
  //     !fastRGLPropsEqual(props, nextProps, isEqual) ||
  //     state.activeDrag !== nextState.activeDrag ||
  //     state.mounted !== nextState.mounted ||
  //     state.droppingPosition !== nextState.droppingPosition
  //   );
  // }


  /**
   * When dragging starts
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
  const onDragStart = (
          i: string,
          x: number,
          y: number,
          {e, node}: GridDragEvent
  ): void => {
    const {layout} = state;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    setState(prevState => ({
      ...prevState,
      oldDragItem: cloneLayoutItem(l),
      oldLayout: state.layout
    }));

    return props.onDragStart(layout, l, l, null, e, node);
  }

  /**
   * Each drag movement create a new dragelement and move the element to the dragged location
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
  const onDrag = (i: string, x: number, y: number, {e, node}: GridDragEvent): void => {
    const {oldDragItem} = state;
    let {layout} = state;
    const {cols} = props;
    const l = getLayoutItem(layout, i);
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
    layout = moveElement(
            layout,
            l,
            x,
            y,
            isUserAction,
            props.preventCollision,
            compactType(props),
            cols
    );

    props.onDrag(layout, oldDragItem, l, placeholder, e, node);

    setState(prevState => ({
      ...prevState,
      layout: compact(layout, compactType(props), cols),
      activeDrag: placeholder
    }));
  }


  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {String} i Index of the child.
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
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
    const l = getLayoutItem(layout, i);
    if (!l) return;

    // Move the element here
    const isUserAction = true;
    layout = moveElement(
            layout,
            l,
            x,
            y,
            isUserAction,
            preventCollision,
            compactType(props),
            cols
    );

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

    onLayoutMaybeChanged(newLayout, oldLayout);
  }


  const onResizeStart = (i: string, w: number, h: number, {e, node}: GridResizeEvent) => {
    const l = getLayoutItem(state.layout, i);
    if (!l) return;

    setState(prevState => ({
      ...prevState,
      oldResizeItem: cloneLayoutItem(l),
      oldLayout: state.layout
    }));

    props.onResizeStart(state.layout, l, l, null, e, node);
  }

  const onResize = (i: string, w: number, h: number, {e, node}: GridResizeEvent) => {

    const [newLayout, l] = withLayoutItem(state.layout, i, l => {
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
    const placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      static: true,
      i: i
    };

    props.onResize(newLayout, state.oldResizeItem, l, placeholder, e, node);

    // Re-compact the newLayout and set the drag placeholder.
    setState(prevState => ({
      ...prevState,
      layout: compact(newLayout, compactType(props), props.cols),
      activeDrag: placeholder
    }));
  }

  const onResizeStop = (i: string, w: number, h: number, {e, node}: GridResizeEvent) => {
    const {layout, oldResizeItem} = state;
    const {cols} = props;
    const l = getLayoutItem(layout, i);

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

    onLayoutMaybeChanged(newLayout, oldLayout);
  }

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  const placeholder = ():  ReactElement<any> => {
    const {activeDrag} = state;
    if (!activeDrag) return null;

    // {...state.activeDrag} is pretty slow, actually
    return (
            <GridItem
                    w={activeDrag.w}
                    h={activeDrag.h}
                    x={activeDrag.x}
                    y={activeDrag.y}
                    i={activeDrag.i}
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
    );
  }

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  const processGridItem = (
          child ,
          isDroppingItem
  )  => {
    if (!child || !child.key) return;
    const l = getLayoutItem(state.layout, String(child.key));
    if (!l) return null;
    const {mounted, droppingPosition} = state;

    // Determine user manipulations possible.
    // If an item is static, it can't be manipulated by default.
    // Any properties defined directly on the grid item will take precedence.
    const draggable =
            typeof l.isDraggable === "boolean"
                    ? l.isDraggable
                    : !l.static && props.isDraggable;
    const resizable =
            typeof l.isResizable === "boolean"
                    ? l.isResizable
                    : !l.static && props.isResizable;
    const resizeHandlesOptions = l.resizeHandles || props.resizeHandles;

    // isBounded set on child if set on parent, and child is not explicitly false
    const bounded = draggable && props.isBounded && l.isBounded !== false;

    return (
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
                    onDragStop={onDragStop}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onResizeStart={onResizeStart}
                    onResize={onResize}
                    onResizeStop={onResizeStop}
                    isDraggable={draggable}
                    isResizable={resizable}
                    isBounded={bounded}
                    useCSSTransforms={props.useCSSTransforms && mounted}
                    usePercentages={!mounted}
                    transformScale={props.transformScale}
                    w={l.w}
                    h={l.h}
                    x={l.x}
                    y={l.y}
                    i={l.i}
                    minH={l.minH}
                    minW={l.minW}
                    maxH={l.maxH}
                    maxW={l.maxW}
                    static={l.static}
                    droppingPosition={isDroppingItem ? droppingPosition : undefined}
                    resizeHandles={resizeHandlesOptions}
                    resizeHandle={props.resizeHandle}
      >
        {child}
      </GridItem>
    );
  }

  // Called while dragging an element. Part of browser native drag/drop API.
  // Native event target might be the layout itself, or an element within the layout.
  const onDragOver  = (e) => {
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

    if (!state.droppingDOMNode) {
      const positionParams: PositionParams = {
        cols: props.cols,
        margin: props.margin,
        maxRows: props.maxRows,
        rowHeight: props.rowHeight,
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
    } else if (state.droppingPosition) {
      const {left, top} = state.droppingPosition;
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
  };

  const removeDroppingPlaceholder: () => void = () => {
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
  };

  const onDragLeave: () => void = () => {
    dragEnterCounter--;

    // onDragLeave can be triggered on each layout's child.
    // But we know that count of dragEnter and dragLeave events
    // will be balanced after leaving the layout's container
    // so we can increase and decrease count of dragEnter and
    // when it'll be equal to 0 we'll remove the placeholder
    if (dragEnterCounter === 0) {
      removeDroppingPlaceholder();
    }
  };

  const onDragEnter: () => void = () => {
    dragEnterCounter++;
  };

  const onDrop  = (e: Event) => {
    const item = state.layout.find(l => l.i === props.droppingItem.i);

    // reset dragEnter counter on drop
    dragEnterCounter = 0;

    removeDroppingPlaceholder();

    props.onDrop(state.layout, item, e);
  };


  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  const containerHeight = ()  => {
    if (!props.autoSize) return;
    const nbRow = bottom(state.layout);
    const height = nbRow * props.rowHeight +
              props.margin[1] +
              props.containerPadding[1] +
              "px";
    return height !== undefined && height !== null && height !== 0 ? height : props.height;
  }

  // console.log(props.height)

  return (
          <div
                  ref={props.innerRef}
                  className={classNames(layoutClassName, props.className)}
                  style={{
                    height: containerHeight(),
                    // height: !props.autoSize ? props.height : undefined,
                    ...(props.style)
                  }}
                  onDrop={props.isDroppable ? onDrop : noop}
                  onDragLeave={props.isDroppable ? onDragLeave : noop}
                  onDragEnter={props.isDroppable ? onDragEnter : noop}
                  onDragOver={props.isDroppable ? onDragOver : noop}
          >
            {React.Children.map(props.children, child =>
                    processGridItem(child)
            )}
            {props.isDroppable &&
            state.droppingDOMNode &&
            processGridItem(state.droppingDOMNode, true)}
            {placeholder()}
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
  onLayoutChange: noop,
  onDragStart: noop,
  onDrag: noop,
  onDragStop: noop,
  onResizeStart: noop,
  onResize: noop,
  onResizeStop: noop,
  onDrop: noop
}

export default ReactGridLayout
