import _ from "lodash";
import React from "react";
import RGL from '../lib/ReactGridLayout';

const ReactGridLayout = RGL;

/**
 * This layout demonstrates how to use the `onResize` handler to enforce a min/max width and height.
 *
 * In this grid, all elements are allowed a max width of 2 if the height < 3,
 * and a min width of 2 if the height >= 3.
 */
const DynamicMinMaxLayout = (props) => {

  return (
          <div style={{
            height: `100%`
          }}>
            <ReactGridLayout
                    onLayoutChange={(layout) => {
                      // props.onLayoutChange(layout);
                    }}
                    onResize={(layout, oldLayoutItem, layoutItem, placeholder) => {
                      // `oldLayoutItem` contains the state of the item before the resize.
                      // You can modify `layoutItem` to enforce constraints.

                      if (layoutItem.h < 3 && layoutItem.w > 2) {
                        layoutItem.w = 2;
                        placeholder.w = 2;
                      }

                      if (layoutItem.h >= 3 && layoutItem.w < 2) {
                        layoutItem.w = 2;
                        placeholder.w = 2;
                      }
                    }}
                    {...props}
            >
              {_.map(_.map(new Array(props.items), function(item, i) {
                const w = _.random(1, 2);
                const h = _.random(1, 3);
                return {
                  x: (i * 2) % 12,
                  y: Math.floor(i / 6),
                  w: w,
                  h: h,
                  i: i.toString()
                };
              }), function(l) {
                return (
                        <div key={l.i}
                             data-grid={l}>
                          <span className="text">{l.i}</span>
                        </div>
                );
              })}
            </ReactGridLayout>
          </div>
  );
}

DynamicMinMaxLayout.defaultProps = {
  isDraggable: true,
  isResizable: true,
  items: 20,
  rowHeight: 30,
  onLayoutChange: function() {
  },
  cols: 12
};

export default DynamicMinMaxLayout
