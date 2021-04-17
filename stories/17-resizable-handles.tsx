import React from "react";
import _ from "lodash";
import ResponsiveReactGridLayout from '../lib/ResponsiveReactGridLayout';

const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
const ResizableHandles = (props) => {

  const [state, setState] = React.useState({
    layout: {
      lg: _.map(new Array(20), function(item, i) {
        const y = _.result(props, "y") || Math.ceil(Math.random() * 4) + 1;
        return {
          x: (i * 2) % 12,
          y: Math.floor(i / 6) * y,
          w: 2,
          h: y,
          i: i.toString(),
          resizeHandles: _.shuffle(availableHandles).slice(0, _.random(1, availableHandles.length - 1))
        };
      })
    }
  });

  return (
      <ResponsiveReactGridLayout
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
    );
}

export default ResizableHandles
