import React from "react";
import RGL, {WidthProvider} from "../react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);
const originalLayout = getFromLS("layout") || [];


const LocalStorageLayout = (props) => {

  const [state, setState] = React.useState()

  React.useEffect(() => {
    setState({
      layout: JSON.parse(JSON.stringify(originalLayout))
    })
  }, [])

  return (
          <div style={{
            height: `100%`,
          }}>
            <button onClick={() => {
              setState({
                layout: []
              });
            }}>
              Reset Layout
            </button>
            {state?.layout && (
                    <ReactGridLayout
                            {...props}
                            layout={state.layout}
                            onLayoutChange={(layout) => {
                              /*eslint no-console: 0*/
                              saveToLS("layout", layout);
                              setState({layout});
                              props.onLayoutChange(layout); // updates status display
                            }}
                    >
                      <div key="1"
                           data-grid={{w: 2, h: 3, x: 0, y: 0}}>
                        <span className="text">1</span>
                      </div>
                      <div key="2"
                           data-grid={{w: 2, h: 3, x: 2, y: 0}}>
                        <span className="text">2</span>
                      </div>
                      <div key="3"
                           data-grid={{w: 2, h: 3, x: 4, y: 0}}>
                        <span className="text">3</span>
                      </div>
                      <div key="4"
                           data-grid={{w: 2, h: 3, x: 6, y: 0}}>
                        <span className="text">4</span>
                      </div>
                      <div key="5"
                           data-grid={{w: 2, h: 3, x: 8, y: 0}}>
                        <span className="text">5</span>
                      </div>
                    </ReactGridLayout>
            )}
          </div>
  );
}

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
            "rgl-7",
            JSON.stringify({
              [key]: value
            })
    );
  }
}


LocalStorageLayout.defaultProps = {
  className: "layout",
  cols: 12,
  rowHeight: 30,
  onLayoutChange: function() {
  }
};

export default LocalStorageLayout
