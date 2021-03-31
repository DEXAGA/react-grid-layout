// @flow
import _ from "lodash";
import * as React from "react";
import WidthProvider from '../react-grid-layout/lib/components/WidthProvider';
import RGL from '../react-grid-layout/lib/ResponsiveReactGridLayout';
import type {Layout, LayoutItem} from '../react-grid-layout/lib/utils';

const ResponsiveReactGridLayout = WidthProvider(RGL);

const lg = _.map(_.range(0, 25), function(item, i) {
  var y = Math.ceil(Math.random() * 4) + 1;
  return {
    x: Math.round(Math.random() * 5) * 2,
    y: Math.floor(i / 6) * y,
    w: 2,
    h: y,
    i: i.toString(),
    static: Math.random() < 0.05
  };
});
const ShowcaseLayout = (props: {
  className: "layout",
  // rowHeight: 30,
  onLayoutChange: () => {},
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
}) => {

  const [state, setState] = React.useState({
    height: 300,
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: true,
  })
  const parentRef = React.useRef();

  const onWindowResize = () => {
    if (!state.mounted) return;
    const node = parentRef.current; // Flow casts this to Text | Element
    // fix: grid position error when node or parentNode display is none by window resize
    // #924 #1084
    if (node instanceof HTMLElement && node.offsetHeight) {
      setState(prevState => ({
                ...prevState,
                height: node.offsetHeight,
              })
      );
    }
  };

  React.useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();
    setState(prevState => ({
      ...prevState,
      layouts: {
        lg: [{
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }, {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          i: `first`,
        }
        ]
      }
    }))
    return () => {
      setState(prevState => ({
        ...prevState,
        mounted: false,
      }))
      window.removeEventListener("resize", onWindowResize);
    }
  }, [])

  const onBreakpointChange = (breakpoint) => {
    setState(prevState => ({
              ...prevState,
              currentBreakpoint: breakpoint,
            })
    );
  };

  const onCompactTypeChange = () => {
    const {compactType: oldCompactType} = state;
    const compactType =
            oldCompactType === "horizontal"
                    ? "vertical"
                    : oldCompactType === "vertical"
                    ? null
                    : "horizontal";
    setState(prevState => ({
      ...prevState,
      compactType,
    }));
  };

  const onLayoutChange = (layout, layouts) => {
    // props.onLayoutChange(layout, layouts);
  };

  const onNewLayout = () => {
    setState(prevState => ({
              ...prevState,
              layouts: {lg: lg},
            })
    );
  };

  const onDrop: (layout: Layout, item: ?LayoutItem, e: Event) => void = (elemParams) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  // console.log(state.layouts)
  const paddingX = 10;
  const paddingY = 10;
  const marginX = 10;
  const marginY = 10;

  function generateLayout() {
    return _.map(state.layouts.lg, function(l, i) {
      return (
              <div key={i}
                   className={l.static ? "static" : ""}>
                {l.static ? (
                        <div
                                className="text"
                                title="This item is static and cannot be removed or resized."
                        >
                          Static - {i}
                        </div>
                ) : (
                        <div className="text">
                          {i}
                        </div>
                )}
              </div>
      );
    });
  }

  return (
          <div style={{
            height: `100vh`
          }}>
            <div ref={parentRef}
                 style={{
                   height: `100%`
                 }}>
              {state?.layouts?.lg && (
                      <ResponsiveReactGridLayout
                              {...props}
                              layouts={state.layouts}
                              onBreakpointChange={onBreakpointChange}
                              onLayoutChange={onLayoutChange}
                              onDrop={onDrop}
                              // WidthProvider option
                              measureBeforeMount={false}
                              // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
                              // and set `measureBeforeMount={true}`.
                              useCSSTransforms={state.mounted}
                              compactType={state.compactType}
                              preventCollision={!state.compactType}
                              autoSize={true}
                              // containerPadding={[10, paddingY]}
                              // margin={[10, marginY]}
                              containerPadding={[paddingX, paddingY]}
                              margin={[marginX, marginY]}
                              rowHeight={state.height / 12 - marginY / 12 - paddingY / 12}
                              height={state.height}
                      >
                        {generateLayout()}
                      </ResponsiveReactGridLayout>
              )}
            </div>
          </div>
  );
}

export default ShowcaseLayout
