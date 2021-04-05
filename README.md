# React-Grid-Layout-Hooks

## Table of Contents

- [React Grid Layout Prior to Hooks Upgrade](#react-grid-layout-prior-to-hooks-upgrade)

- [Motivation For This Fork](#motivation-for-this-fork)
- [Changes From Original](#changes-from-the-original-react-grid-layout)
- [TODO List](#todo-list)
- [Installation](#installation)
- [Usage](#usage)
- [Responsive Usage](#responsive-usage)
- [Providing Grid Width](#providing-grid-width)
- [Grid Layout Props](#grid-layout-props)
- [Responsive Grid Layout Props](#responsive-grid-layout-props)
- [Grid Item Props](#grid-item-props)
- [Performance](#performance)
- [Contribute](#contribute)

## Original Project Reference:

https://github.com/react-grid-layout/react-grid-layout.git

![BitMEX UI](http://i.imgur.com/oo1NT6c.gif)
> GIF from production usage on [BitMEX.com](https://www.bitmex.com)

## Motivation for this fork:
The original RGL is a **fantastic** React-based utility that has helped a ton of React developers build awesome dashboard-related apps. 
It appears however, that maintenance on the project has slowed down a bit for various reasons including a shift in maintainers and overall maturity of the project. 
The project's original use case seems to have been reached so the maintainers have not been able to accommodate a lot of new feature requests lately. 
Furthermore, the fact that a large number of individuals and businesses rely on RGL seems to have made it hard to update the source code, tests or webpack build without breaking things for a lot of people.

Here's my attempt at reviving community engagement on the project and giving it a fresh start so I'm open to ideas. Any feedback would be greatly appreciated!

## Changes from the original React-grid-layout

- **Migration to Hooks:** I've rewritten some of the core components from legacy Class components to Functional components so that we can fully support React Hooks.j
- **Migration to Typescript:** Most flow types have been removed in favor of Typescript which appears to be the de facto type utility.

## TODO List:

- [x] Create a Storybook with the examples in it.
- [x] Migrate Flow to Typescript
- [ ] Finish migrating remaining components/examples to Hooks
- [ ] Manually read typescript using old flow types as a reference (not a big project)
- [ ] Upgrade Width/Height providers to hooks
- [ ] Create new npm package for distribution.
- [ ] Create a codesandbox for main showcase and issue replication.
- [ ] Migrate or redo basic tests.
- [ ] Redo CI Workflows.

#### Projects Using React-Grid-Layout

- [BitMEX](https://www.bitmex.com/)
- [AWS CloudFront Dashboards](https://aws.amazon.com/blogs/aws/cloudwatch-dashboards-create-use-customized-metrics-views/)
- [Grafana](https://grafana.com/)
- [Metabase](http://www.metabase.com/)
- [HubSpot](http://www.hubspot.com)
- [ComNetViz](http://www.grotto-networking.com/ComNetViz/ComNetViz.html)
- [Stoplight](https://app.stoplight.io)
- [Reflect](https://reflect.io)
- [ez-Dashing](https://github.com/ylacaute/ez-Dashing)
- [Kibana](https://www.elastic.co/products/kibana)
- [Graphext](https://graphext.com/)
- [Monday](https://support.monday.com/hc/en-us/articles/360002187819-What-are-the-Dashboards-)
- [Quadency](https://quadency.com/)
- [Hakkiri](https://www.hakkiri.io)
- [Ubidots](https://help.ubidots.com/en/articles/2400308-create-dashboards-and-widgets)
- [Statsout](https://statsout.com/)

*Know of others? Create a PR to let me know!*

## Features

* 100% React - no jQuery
* Compatible with server-rendered apps
* Draggable widgets
* Resizable widgets
* Static widgets
* Configurable packing: horizontal, vertical, or off
* Bounds checking for dragging and resizing
* Widgets may be added or removed without rebuilding grid
* Layout can be serialized and restored
* Responsive breakpoints
* Separate layouts per responsive breakpoint
* Grid Items placed using CSS Transforms
  * Performance with CSS Transforms: [on](http://i.imgur.com/FTogpLp.jpg) / [off](http://i.imgur.com/gOveMm8.jpg), note paint (green) as % of time
* Compatibility with `<React.StrictMode>`

## Installation

TODO

## Usage

Use ReactGridLayout like any other component. The following example below will
produce a grid with three items where:

- users will not be able to drag or resize item `a`
- item `b` will be restricted to a minimum width of 2 grid blocks and a maximum width of 4 grid blocks
- users will be able to freely drag and resize item `c`

```js
import GridLayout from 'react-grid-layout';

class MyFirstGrid extends React.Component {
  render() {
    // layout is an array of objects, see the demo for more complete usage
    const layout = [
      {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
      {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
      {i: 'c', x: 4, y: 0, w: 1, h: 2}
    ];
    return (
      <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
        <div key="a">a</div>
        <div key="b">b</div>
        <div key="c">c</div>
      </GridLayout>
    )
  }
}
```

You may also choose to set layout properties directly on the children:

```js
import GridLayout from 'react-grid-layout';

class MyFirstGrid extends React.Component {
  render() {
    return (
      <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
        <div key="a" data-grid={{x: 0, y: 0, w: 1, h: 2, static: true}}>a</div>
        <div key="b" data-grid={{x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4}}>b</div>
        <div key="c" data-grid={{x: 4, y: 0, w: 1, h: 2}}>c</div>
      </GridLayout>
    )
  }
}
```

### Responsive Usage

To make RGL responsive, use the `<ResponsiveReactGridLayout>` element:

```js
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';

class MyResponsiveGrid extends React.Component {
  render() {
    // {lg: layout1, md: layout2, ...}
    const layouts = getLayoutsFromSomewhere();
    return (
      <ResponsiveGridLayout className="layout" layouts={layouts}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    )
  }
}
```

When in responsive mode, you should supply at least one breakpoint via the `layouts` property.

When using `layouts`, it is best to supply as many breakpoints as possible, especially the largest one.
If the largest is provided, RGL will attempt to interpolate the rest.

You will also need to provide a `width`, when using `<ResponsiveReactGridLayout>` it is suggested you use the HOC
`WidthProvider` as per the instructions below.

It is possible to supply default mappings via the `data-grid` property on individual
items, so that they would be taken into account within layout interpolation.

### Providing Grid Width

Both `<ResponsiveReactGridLayout>` and `<ReactGridLayout>` take `width` to calculate
positions on drag events. In simple cases a HOC `WidthProvider` can be used to automatically determine
width upon initialization and window resize events.

```js
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

class MyResponsiveGrid extends React.Component {
  render() {
    // {lg: layout1, md: layout2, ...}
    var layouts = getLayoutsFromSomewhere();
    return (
      <ResponsiveGridLayout className="layout" layouts={layouts}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    )
  }
}
```

This allows you to easily replace `WidthProvider` with your own Provider HOC if you need more sophisticated logic.

`WidthProvider` accepts a single prop, `measureBeforeMount`. If `true`, `WidthProvider` will measure the
container's width before mounting children. Use this if you'd like to completely eliminate any resizing animation
on application/component mount.

Have a more complicated layout? `WidthProvider` [is very simple](/lib/components/WidthProvider.jsx) and only
listens to window `'resize'` events. If you need more power and flexibility, try the
[SizeMe React HOC](https://github.com/ctrlplusb/react-sizeme) as an alternative to WidthProvider.

### Grid Layout Props

RGL supports the following properties (see the source for the final word on this):

```js
//
// Basic props
//

// This allows setting the initial width on the server side.
// This is required unless using the HOC <WidthProvider> or similar
width: number,

// If true, the container height swells and contracts to fit contents
autoSize: ?boolean = true,

// Number of columns in this layout.
cols: ?number = 12,

// A CSS selector for tags that will not be draggable.
// For example: draggableCancel:'.MyNonDraggableAreaClassName'
// If you forget the leading . it will not work.
draggableCancel: ?string = '',

// A CSS selector for tags that will act as the draggable handle.
// For example: draggableHandle:'.MyDragHandleClassName'
// If you forget the leading . it will not work.
draggableHandle: ?string = '',

// If true, the layout will compact vertically
verticalCompact: ?boolean = true,

// Compaction type.
compactType: ?('vertical' | 'horizontal') = 'vertical';

// Layout is an array of object with the format:
// {x: number, y: number, w: number, h: number}
// The index into the layout must match the key used on each item component.
// If you choose to use custom keys, you can specify that key in the layout
// array objects like so:
// {i: string, x: number, y: number, w: number, h: number}
layout: ?array = null, // If not provided, use data-grid props on children

// Margin between items [x, y] in px.
margin: ?[number, number] = [10, 10],

// Padding inside the container [x, y] in px
containerPadding: ?[number, number] = margin,

// Rows have a static height, but you can change this based on breakpoints
// if you like.
rowHeight: ?number = 150,

// Configuration of a dropping element. Dropping element is a "virtual" element
// which appears when you drag over some element from outside.
// It can be changed by passing specific parameters:
//  i - id of an element
//  w - width of an element
//  h - height of an element
droppingItem?: { i: string, w: number, h: number }

//
// Flags
//
isDraggable: ?boolean = true,
isResizable: ?boolean = true,
isBounded: ?boolean = false,
// Uses CSS3 translate() instead of position top/left.
// This makes about 6x faster paint performance
useCSSTransforms: ?boolean = true,
// If parent DOM node of ResponsiveReactGridLayout or ReactGridLayout has "transform: scale(n)" css property,
// we should set scale coefficient to avoid render artefacts while dragging.
transformScale: ?number = 1,

// If true, grid items won't change position when being
// dragged over.
preventCollision: ?boolean = false;

// If true, droppable elements (with `draggable={true}` attribute)
// can be dropped on the grid. It triggers "onDrop" callback
// with position and event object as parameters.
// It can be useful for dropping an element in a specific position
//
// NOTE: In case of using Firefox you should add
// `onDragStart={e => e.dataTransfer.setData('text/plain', '')}` attribute
// along with `draggable={true}` otherwise this feature will work incorrect.
// onDragStart attribute is required for Firefox for a dragging initialization
// @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
isDroppable: ?boolean = false
// Defines which resize handles should be rendered
// Allows for any combination of:
// 's' - South handle (bottom-center)
// 'w' - West handle (left-center)
// 'e' - East handle (right-center)
// 'n' - North handle (top-center)
// 'sw' - Southwest handle (bottom-left)
// 'nw' - Northwest handle (top-left)
// 'se' - Southeast handle (bottom-right)
// 'ne' - Northeast handle (top-right)
resizeHandles: ?Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> = ['se']
// Custom component for resize handles
resizeHandle?: ReactElement<any> | ((resizeHandleAxis: ResizeHandleAxis) => ReactElement<any>)

//
// Callbacks
//

// Callback so you can save the layout.
// Calls back with (currentLayout) after every drag or resize stop.
onLayoutChange: (layout: Layout) => void,

//
// All callbacks below have signature (layout, oldItem, newItem, placeholder, e, element).
// 'start' and 'stop' callbacks pass `undefined` for 'placeholder'.
//
type ItemCallback = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem,
                     placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void;

// Calls when drag starts.
onDragStart: ItemCallback,
// Calls on each drag movement.
onDrag: ItemCallback,
// Calls when drag is complete.
onDragStop: ItemCallback,
// Calls when resize starts.
onResizeStart: ItemCallback,
// Calls when resize movement happens.
onResize: ItemCallback,
// Calls when resize is complete.
onResizeStop: ItemCallback,
// Calls when an element has been dropped into the grid from outside.
onDrop: (layout: Layout, item: ?LayoutItem, e: Event) => void

// Ref for getting a reference for the grid's wrapping div.
// You can use this instead of a regular ref and the deprecated `ReactDOM.findDOMNode()`` function.
innerRef: ?React.Ref<"div">
```

### Responsive Grid Layout Props

The responsive grid layout can be used instead. It supports all of the props above, excepting `layout`.
The new properties and changes are:

```js
// {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
// Breakpoint names are arbitrary but must match in the cols and layouts objects.
breakpoints: ?Object = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},

// # of cols. This is a breakpoint -> cols map, e.g. {lg: 12, md: 10, ...}
cols: ?Object = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},


// margin (in pixels). Can be specified either as horizontal and vertical margin, e.g. `[10, 10]` or as a breakpoint -> margin map, e.g. `{lg: [10, 10], md: [10, 10], ...}.
margin: [number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}


// containerPadding (in pixels). Can be specified either as horizontal and vertical padding, e.g. `[10, 10]` or as a breakpoint -> containerPadding map, e.g. `{lg: [10, 10], md: [10, 10], ...}.
containerPadding: [number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}


// layouts is an object mapping breakpoints to layouts.
// e.g. {lg: Layout, md: Layout, ...}
layouts: {[key: $Keys<breakpoints>]: Layout}

//
// Callbacks
//

// Calls back with breakpoint and new # cols
onBreakpointChange: (newBreakpoint: string, newCols: number) => void,

// Callback so you can save the layout.
// AllLayouts are keyed by breakpoint.
onLayoutChange: (currentLayout: Layout, allLayouts: {[key: $Keys<breakpoints>]: Layout}) => void,

// Callback when the width changes, so you can modify the layout as needed.
onWidthChange: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;

```

### Grid Item Props

RGL supports the following properties on grid items or layout items. When initializing a grid,
build a layout array (as in the first example above), or attach this object as the `data-grid` property
to each of your child elements (as in the second example).

Note that if a grid item is provided but incomplete (missing one of `x, y, w, or h`), an error
will be thrown so you can correct your layout.

If no properties are provided for a grid item, one will be generated with a width and height of `1`.

You can set minimums and maximums for each dimension. This is for resizing; it of course has no effect if resizing
is disabled. Errors will be thrown if your mins and maxes overlap incorrectly, or your initial dimensions
are out of range.

Any `<GridItem>` properties defined directly will take precedence over globally-set options. For
example, if the layout has the property `isDraggable: false`, but the grid item has the prop `isDraggable: true`, the item
will be draggable, even if the item is marked `static: true`.

```js
{

  // A string corresponding to the component key
  i: string,

  // These are all in grid units, not pixels
  x: number,
  y: number,
  w: number,
  h: number,
  minW: ?number = 0,
  maxW: ?number = Infinity,
  minH: ?number = 0,
  maxH: ?number = Infinity,

  // If true, equal to `isDraggable: false, isResizable: false`.
  static: ?boolean = false,
  // If false, will not be draggable. Overrides `static`.
  isDraggable: ?boolean = true,
  // If false, will not be resizable. Overrides `static`.
  isResizable: ?boolean = true,
  // By default, a handle is only shown on the bottom-right (southeast) corner.
  // Note that resizing from the top or left is generally not intuitive.
  resizeHandles?: ?Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> = ['se']
  // If true and draggable, item will be moved only within grid.
  isBounded: ?boolean = false
}
```

### Performance

If you memoize your children, you can take advantage of this, and reap faster rerenders. For example:

```js
function MyGrid(props) {
  const children = React.useMemo(() => {
    return new Array(props.count).fill(undefined).map((val, idx) => {
      return <div key={idx} data-grid={{x: idx, y: 1, w: 1, h: 1}} />;
    });
  }, [props.count]);
  return <ReactGridLayout cols={12}>{children}</ReactGridLayout>;
}
```

Because the `children` prop doesn't change between rerenders, updates to `<MyGrid>` won't result in new renders, improving performance.

## Contribute

Clone the project:

```git clone git@github.com:DEXAGA/react-grid-layout-hooks.git```

Run the storybook to see examples

```yarn storybook```

Start create-react-app to fiddle with components. The hot reloader and error handler is MUCH better in this build than in the storybook

```yarn start```

If you have a feature request, please add it as an issue or make a pull request.

If you have a bug to report, please reproduce the bug in a codesandbox to help
others easily isolate it.

Feature requests are much appreciated and if you could reproduce errors in a codesandbox, that would be awesome!
