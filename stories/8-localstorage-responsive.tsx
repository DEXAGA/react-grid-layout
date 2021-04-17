import React from "react";
import ResponsiveReactGridLayout from "../lib/ResponsiveReactGridLayout";

/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
const ResponsiveLocalStorageLayout = () => {

  const [state, setState] = React.useState({
    layouts: JSON.parse(JSON.stringify(getFromLS("layouts")))
  });

  const resetLayout = () => {
    setState(prevState => ({
      ...prevState,
      layouts: undefined
    }));
  }

  const onLayoutChange = (layout, layouts) => {
    saveToLS("layouts", layouts);
    setState(prevState => ({
      ...prevState,
      layouts
    }));
  }

  return (
          <div>
            <button onClick={() => resetLayout()}>Reset Layout</button>
                    <ResponsiveReactGridLayout
                            cols={{lg: 12, md: 10, sm: 6, xs: 1, xxs: 1}}
                            layouts={state.layouts}
                            onLayoutChange={(layout, layouts) => {
                              onLayoutChange(layout, layouts);
                            }}
                    >
                      <div key="1"
                           data-grid={{w: 2, h: 3, x: 0, y: 0, minW: 2, minH: 3}}>
                        <span className="text">1</span>
                      </div>
                      <div key="2"
                           data-grid={{w: 2, h: 3, x: 2, y: 0, minW: 2, minH: 3}}>
                        <span className="text">2</span>
                      </div>
                      <div key="3"
                           data-grid={{w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3}}>
                        <span className="text">3</span>
                      </div>
                      <div key="4"
                           data-grid={{w: 2, h: 3, x: 6, y: 0, minW: 2, minH: 3}}>
                        <span className="text">4</span>
                      </div>
                      <div key="5"
                           data-grid={{w: 2, h: 3, x: 8, y: 0, minW: 2, minH: 3}}>
                        <span className="text">5</span>
                      </div>
                    </ResponsiveReactGridLayout>
          </div>
  );
}


function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key] ?? null;
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
            "rgl-8",
            JSON.stringify({
              [key]: value
            })
    );
  }
}

export default ResponsiveLocalStorageLayout
