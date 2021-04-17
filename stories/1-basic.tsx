import _ from "lodash";
import React from "react";
import ResponsiveReactGridLayout from "../lib/ResponsiveReactGridLayout";

const BasicLayout = (props) => {

  const [state, setState] = React.useState({
    layout: null,
    height: undefined
  })

  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      layout: {
        lg: _.map(new Array(20), function(item, i) {
          const y = _.result(props, "y") || Math.ceil(Math.random() * 4) + 1;
          return {
            x: (i * 2) % 12,
            y: Math.floor(i / 6) * y,
            w: 2,
            h: y,
            i: i.toString()
          };
        })
      }
    }))
  }, [])

  return (
          <div style={{
            height: `100%`
          }}>
            {state?.layout && (
                    <ResponsiveReactGridLayout
                            cols={12}
                            rows={12}
                            layouts={state.layout}
                    >
                      {_.map(_.range(20), function(i) {
                        return (
                                <div key={i}>
                                  <span className="text">{i}</span>
                                </div>
                        );
                      })}
                    </ResponsiveReactGridLayout>
            )}
          </div>
  );
}

export default BasicLayout
