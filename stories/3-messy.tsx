// @flow
import _ from "lodash";
import * as React from "react";
import ReactGridLayout from '../lib/ResponsiveReactGridLayout';

const MessyLayout = (props) => {

  const [state, setState] = React.useState({
    layout: {
      lg: _.map(new Array(20), function(item, i) {
        const w = Math.ceil(Math.random() * 4);
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: (i * 2) % 12,
          y: Math.floor(i / 6) * y,
          w: w,
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
            {state?.layout && (
                    <ReactGridLayout
                            layouts={state.layout}
                            
                            cols={12}
                    >
                      {_.map(_.range(20), function(i) {
                        return (
                                <div key={i}>
                                  <span className="text">{i}</span>
                                </div>
                        );
                      })}
                    </ReactGridLayout>
            )}
          </div>
  );
}

export default MessyLayout
