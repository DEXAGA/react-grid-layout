import React from "react";
import _ from "lodash";
import RGL from '../lib/ResponsiveReactGridLayout';

const ReactGridLayout = RGL;

const BoundedLayout = (props) => {

  const [state, setState] = React.useState({
    layout: _.map(new Array(props.items), function(item, i) {
      const y = _.result(props, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString()
      };
    })
  });

  return (
      <ReactGridLayout
        layout={state.layout}
        onLayoutChange={(layout) => {
          props.onLayoutChange(layout);
        }}
        isBounded={true}
        {...props}
      >
        {_.map(_.range(props.items), function(i) {
          return (
                  <div key={i}>
                    <span className="text">{i}</span>
                  </div>
          );
        })}
      </ReactGridLayout>
    );
}

BoundedLayout.defaultProps = {
  className: "layout",
  items: 20,
  rowHeight: 30,
  onLayoutChange: function() {},
  cols: 12
};

export default BoundedLayout
