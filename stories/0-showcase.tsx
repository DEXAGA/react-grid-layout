import _ from "lodash";
import * as React from "react";
import RGL from 'react-grid-layout-hooks/lib/ResponsiveReactGridLayout';
import {WidthProvider} from "../index";

const ResponsiveReactGridLayout = RGL;

const ShowcaseLayout = (props: {
  className?: "layout",
  onLayoutChange?: () => {},
  cols?: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
}) => {

  const [state, setState] = React.useState({
    height: 300,
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
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

  })
  const parentRef = React.useRef();

  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      mounted: true,
    }))
    return () => {
      setState(prevState => ({
        ...prevState,
        mounted: false,
      }))
    }
  }, [])

  // const paddingX = 10;
  // const paddingY = 10;
  // const marginX = 10;
  // const marginY = 10;

  const paddingX = 0;
  const paddingY = 0;
  const marginX = 0;
  const marginY = 0;

  return (
          <div
                  ref={parentRef}
                  style={{
            height: `100vh`
          }}>
              {state?.layouts?.lg && (
                      <ResponsiveReactGridLayout
                              {...props}
                              layouts={state.layouts}
                              onBreakpointChange={(breakpoint) => {
                                setState(prevState => ({
                                          ...prevState,
                                          currentBreakpoint: breakpoint,
                                        })
                                );
                              }}
                              onLayoutChange={(layout, layouts) => {
                                // props.onLayoutChange(layout, layouts);
                              }}
                              onDrop={(elemParams) => {
                                alert(`Element parameters: ${JSON.stringify(elemParams)}`);
                              }}
                              measureBeforeMount={true}
                              useCSSTransforms={state.mounted}
                              compactType={state.compactType}
                              preventCollision={!state.compactType}
                              autoSize={true}
                              containerPadding={[paddingX, paddingY]}
                              margin={[marginX, marginY]}
                      >
                        {_.map(state.layouts.lg, function(l, i) {
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
                        })}
                      </ResponsiveReactGridLayout>
              )}
          </div>
  );
}

export default ShowcaseLayout
