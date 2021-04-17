import _ from "lodash";
import React from "react";
import ReactGridLayout from '../lib/ResponsiveReactGridLayout';

const GridPropertyLayout = (props) => {
  return (
          <ReactGridLayout
                  isDraggable={true}
                  isResizable={true}
                  cols={12}
          >
            {_.map(_.range(20), function(i) {
              return (
                      <div key={i}
                           data-grid={(_.map(new Array(20), function(item, i) {
                             var w = _.result(props, "w") || Math.ceil(Math.random() * 4);
                             var y = _.result(props, "y") || Math.ceil(Math.random() * 4) + 1;
                             return {
                               x: (i * 2) % 12,
                               y: Math.floor(i / 6) * y,
                               w: w,
                               h: y,
                               i: i.toString()
                             };
                           }))[i]}>
                        <span className="text">{i}</span>
                      </div>
              );
            })}
          </ReactGridLayout>
  );
}


export default GridPropertyLayout
