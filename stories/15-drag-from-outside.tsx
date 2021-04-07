import _ from "lodash";
import React from "react";
import {Responsive, WidthProvider} from "react-grid-layout-hooks";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const DragFromOutsideLayout = (props) => {

  const [state, setState] = React.useState({
    layouts: {lg: generateLayout()},
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
  })

  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      mounted: true,
    }))
  }, [])

  return (
          <div>
            {state?.layouts && (
                    <React.Fragment>
                      <div>
                        Current Breakpoint: {state.currentBreakpoint} (
                        {props.cols[state.currentBreakpoint]} columns)
                      </div>
                      <div>
                        Compaction type:{" "}
                        {_.capitalize(state.compactType) || "No Compaction"}
                      </div>
                      <button onClick={() => {
                        setState({
                          ...state,
                          layouts: {lg: generateLayout()}
                        });
                      }}>Generate New Layout</button>
                      <button onClick={() => {
                        const compactType =
                                state.compactType === "horizontal"
                                        ? "vertical"
                                        : state.compactType === "vertical"
                                        ? null
                                        : "horizontal";
                        setState(prevState => ({
                          ...prevState,
                          compactType
                        }));
                      }}>
                        Change Compaction Type
                      </button>
                      <div
                              className="droppable-element"
                              draggable={true}
                              unselectable="on"
                              // this is a hack for firefox
                              // Firefox requires some kind of initialization
                              // which we can do by adding this attribute
                              // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                              onDragStart={e => e.dataTransfer.setData("text/plain", "")}
                      >
                        Droppable Element (Drag me!)
                      </div>
                      <ResponsiveReactGridLayout
                              {...props}
                              layouts={state.layouts}
                              onBreakpointChange={breakpoint => {
                                setState(prevState => ({
                                  ...prevState,
                                  currentBreakpoint: breakpoint
                                }));
                              }}
                              onLayoutChange={(layout, layouts) => {
                                props.onLayoutChange(layout, layouts);
                              }}
                              onDrop={(layout, layoutItem, _event) => {
                                alert(`Dropped element props:\n${JSON.stringify(layoutItem, ['x', 'y', 'w', 'h'], 2)}`);
                              }}
                              // WidthProvider option
                              measureBeforeMount={false}
                              // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
                              // and set `measureBeforeMount={true}`.
                              useCSSTransforms={state.mounted}
                              compactType={state.compactType}
                              preventCollision={!state.compactType}
                              isDroppable={true}
                      >
                        {_.map(state.layouts.lg, function(l, i) {
                          return (
                                  <div key={i}
                                       className={l.static ? "static" : ""}>
                                    {l.static ? (
                                            <span
                                                    className="text"
                                                    title="This item is static and cannot be removed or resized."
                                            >
              Static - {i}
            </span>
                                    ) : (
                                            <span className="text">{i}</span>
                                    )}
                                  </div>
                          );
                        })}
                      </ResponsiveReactGridLayout>
                    </React.Fragment>
            )}
          </div>
  );
}

function generateLayout() {
  return _.map(_.range(0, 25), function(item, i) {
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
}

DragFromOutsideLayout.defaultProps = {
  className: "layout",
  rowHeight: 30,
  onLayoutChange: function() {
  },
  cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
};

export default DragFromOutsideLayout
