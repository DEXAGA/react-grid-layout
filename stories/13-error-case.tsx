import React from "react";
import RGL, {WidthProvider} from "react-grid-layout-hooks";

const ReactGridLayout = WidthProvider(RGL);

const ErrorCaseLayout = (props) => {

  const [state, setState] = React.useState({
    layout: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        i: "1"
      },
      {
        x: 1,
        y: 0,
        w: 1,
        h: 1,
        i: "2"
      },
      {
        x: 0,
        y: 1,
        w: 2,
        h: 2,
        i: "3"
      }
    ]
  })

  return (
          <div style={{
            height: `100%`
          }}>
            {state?.layout && (
                    <ReactGridLayout
                            layout={state.layout}
                            onLayoutChange={(layout) => {
                              props.onLayoutChange(layout);
                            }}
                            {...props}
                    >
                      {[
                        <div key={"1"}>
                          <span className="text">{"1"}</span>
                        </div>,
                        <div key={"2"}>
                          <span className="text">{"2"}</span>
                        </div>,
                        <div key={"3"}>
                          <span className="text">{"3"}</span>
                        </div>
                      ]}
                    </ReactGridLayout>
            )}
          </div>
  );
}

ErrorCaseLayout.defaultProps = {
  className: "layout",
  items: 3,
  rowHeight: 100,
  onLayoutChange: function() {
  },
  cols: 2
};

export default ErrorCaseLayout
