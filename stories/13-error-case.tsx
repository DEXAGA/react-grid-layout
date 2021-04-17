import React from "react";
import ReactGridLayout from '../lib/ResponsiveReactGridLayout';

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
                            cols={2}
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

export default ErrorCaseLayout
