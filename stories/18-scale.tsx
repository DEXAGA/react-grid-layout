import _ from "lodash";
import React from "react";
import ResponsiveReactGridLayout from '../lib/ResponsiveReactGridLayout';

const ScaledLayout = (props) => {

  const [state, setState] = React.useState({
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
  })

  return (
          <div style={{
            height: `100%`
          }}>
            <div style={{transform: 'scale(0.5) translate(-50%, -50%)'}}>
              {state?.layout && (
                      <ResponsiveReactGridLayout
                              layouts={state.layout}
                              transformScale={0.5}
                              onLayoutChange={(layout) => {
                                props.onLayoutChange(layout);
                              }}
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
          </div>
  );
}

export default ScaledLayout
