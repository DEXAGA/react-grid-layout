import React from "react";
import {Responsive, WidthProvider} from "react-grid-layout-hooks";
import _ from "lodash";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function newLayout(prevState) {
  let lg = prevState.layouts.lg
  lg.push({
    i: "n" + prevState.newCounter,
    x: (prevState.layouts.lg.length * 2) % (prevState.cols || 12),
    y: Infinity, // puts it at the bottom
    w: 2,
    h: 2
  })
  return {
    lg: lg
  };
}

/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
const AddRemoveLayout = (props) => {
  const [state, setState] = React.useState({
    layouts: {
      lg: [0, 1, 2, 3, 4].map(function(i, key, list) {
        return {
          i: i.toString(),
          x: i * 2,
          y: 0,
          w: 2,
          h: 2,
          add: i === (list.length - 1)
        };
      })
    },
    newCounter: 0
  })

  return (
          <div>
            <button onClick={() => {
              /*eslint no-console: 0*/
              console.log("adding", "n" + state.newCounter);
              setState(prevState => ({
                ...prevState,
                // Add a new item. It must have a unique key!
                layouts: newLayout(prevState),
                // Increment the counter to ensure key is always unique.
                newCounter: prevState.newCounter + 1
              }));
            }}>
              Add Item
            </button>
            <ResponsiveReactGridLayout
                    onLayoutChange={(layout) => {
                      // props.onLayoutChange(layout);
                      setState(prevState => ({
                        ...prevState,
                        layout: layout
                      }));
                    }}
                    onBreakpointChange={(breakpoint, cols) => {
                      setState(prevState => ({
                        ...prevState,
                        breakpoint: breakpoint,
                        cols: cols
                      }));
                    }}
                    layouts={state.layouts}
                    {...props}
            >
              {state?.layouts?.lg.map(el => {
                let i = el.add ? "+" : el.i;
                return (
                        <div key={i}>
                          {el.add ? (
                                  <span
                                          className="add text"
                                          onClick={() => {
                                            /*eslint no-console: 0*/
                                            console.log("adding", "n" + state.newCounter);
                                            setState(prevState => ({
                                              ...prevState,
                                              // Add a new item. It must have a unique key!
                                              layouts: newLayout(prevState),
                                              // Increment the counter to ensure key is always unique.
                                              newCounter: prevState.newCounter + 1
                                            }));
                                          }}
                                          title="You can add an item by clicking here, too."
                                  >
                                    Add +
                                  </span>
                          ) : (
                                  <span className="text">{i}</span>
                          )}
                          <span
                                  className={"remove"}
                                  style={{
                                    position: "absolute",
                                    right: "2px",
                                    top: 0,
                                    cursor: "pointer"
                                  }}
                                  onClick={(i) => {
                                    console.log("removing", i);
                                    setState(prevState => ({
                                      ...prevState,
                                      layouts: {lg: _.reject(prevState.layouts.lg, {i: i})}
                                    }));
                                  }}
                          >
                            x
                          </span>
                        </div>
                );
              })}
            </ResponsiveReactGridLayout>
          </div>
  );
}

AddRemoveLayout.defaultProps = {
  className: "layout",
  cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
  rowHeight: 100
};

export default AddRemoveLayout
