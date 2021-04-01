import _ from "lodash";
import React from "react";
import RGL, {WidthProvider} from "../react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

const GridPropertyLayout = (props) => {
  return (
          <ReactGridLayout onLayoutChange={(layout) => {
            props.onLayoutChange(layout);
          }} {...props}>
            {_.map(_.range(props.items), function(i) {
              return (
                      <div key={i}
                           data-grid={(_.map(new Array(props.items), function(item, i) {
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

GridPropertyLayout.defaultProps = {
  isDraggable: true,
  isResizable: true,
  items: 20,
  rowHeight: 30,
  onLayoutChange: function() {
  },
  cols: 12
};


export default GridPropertyLayout
