import _ from "lodash";
import React from "react";
import ReactGridLayout from '../lib/ResponsiveReactGridLayout';

const NoCollisionLayout = (props) => {

  const [state, setState] = React.useState({
    layout: {
      lg: _.map(new Array(50), function(item, i) {
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
            {state?.layout && (
                    <ReactGridLayout
                            layouts={state.layout}
                            
                            cols={12}
                            rowHeight={30}
                            verticalCompact={false}
                            preventCollision={true}
                    >
                      {_.map(_.range(50), function(i) {
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


export default NoCollisionLayout
