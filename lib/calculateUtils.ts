import type {Position} from "./utils";

export type PositionParams = {
  margin: [number, number],
  containerPadding: [number, number],
  containerHeight: number,
  cols: number,
  rowHeight: number,
  maxRows: number
};

/**
 * Return position on the page given an x, y, w, h.
 * left, top, width, height are all in pixels.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calculations.
 * @param  {Number}  x                      X coordinate in grid units.
 * @param  {Number}  y                      Y coordinate in grid units.
 * @param  {Number}  w                      W coordinate in grid units.
 * @param  {Number}  h                      H coordinate in grid units.
 * @return {Position}                       Object containing coords.
 */
export function calcGridItemPosition(
  positionParams: PositionParams,
  x: number,
  y: number,
  w: number,
  h: number,
  state: { resizing: any; dragging: any; className?: string; }
)  {
  const colWidth = (
          (positionParams.containerWidth - (positionParams.margin)[0] * (positionParams.cols - 1) - (positionParams.containerPadding)[0] * 2) / positionParams.cols
  );
  const rowHeight = (
          (positionParams.containerHeight - (positionParams.margin)[1] * (positionParams.nbRows - 1) - (positionParams.containerPadding)[1] * 2) / positionParams.nbRows
  );
  const out: Record<any,any> = {};

  // If resizing, use the exact width and height as returned from resizing callbacks.
  if (state && state.resizing) {

    out.width = Math.round(state?.resizing?.width ?? 0);
    out.height = Math.round(state?.resizing?.height ?? 0);
  }
  // Otherwise, calculate from grid units.
  else {
    out.width = !Number.isFinite(w) ? w : Math.round(colWidth * w + Math.max(0, w - 1) * (positionParams.margin)[0]);
    out.height = !Number.isFinite(h) ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * (positionParams.margin)[1]);
  }

  // If dragging, use the exact width and height as returned from dragging callbacks.
  if (state && state.dragging) {
    out.top = Math.round(state.dragging.top);
    out.left = Math.round(state.dragging.left);
  } else if (
          state &&
          state.resizing &&
          typeof state.resizing.top === "number" &&
          typeof state.resizing.left === "number"
  ) {
    out.top = Math.round(state.resizing.top);
    out.left = Math.round(state.resizing.left);
  }
  // Otherwise, calculate from grid units.
  else {
    out.top = Math.round((rowHeight + (positionParams.margin)[1]) * y + (positionParams.containerPadding)[1]);
    out.left = Math.round((colWidth + (positionParams.margin)[0]) * x + (positionParams.containerPadding)[0]);
  }

  return out;
}

/**
 * Translate x and y coordinates from pixels to grid units.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calculations.
 * @param  {Number} top                     Top position (relative to parent) in pixels.
 * @param  {Number} left                    Left position (relative to parent) in pixels.
 * @param  {Number} w                       W coordinate in grid units.
 * @param  {Number} h                       H coordinate in grid units.
 * @return {Object}                         x and y in grid units.
 */
export function calcXY(
  positionParams: PositionParams,
  top: number,
  left: number,
  w: number,
  h: number
): { x: number, y: number } {
  const {margin, cols, maxRows, nbRows} = positionParams;
  const colWidth = (
          (positionParams.containerWidth - (positionParams.margin)[0] * (positionParams.cols - 1) - (positionParams.containerPadding)[0] * 2) / positionParams.cols
  );
  const rowHeight = (
          (positionParams.containerHeight - (positionParams.margin)[1] * (positionParams.nbRows - 1) - (positionParams.containerPadding)[1] * 2) / positionParams.nbRows
  );

  // left = colWidth * x + margin * (x + 1)
  // l = cx + m(x+1)
  // l = cx + mx + m
  // l - m = cx + mx
  // l - m = x(c + m)
  // (l - m) / (c + m) = x
  // x = (left - margin) / (coldWidth + margin)
  let x = Math.round((left - margin[0]) / (colWidth + margin[0]));
  let y = Math.round((top - margin[1]) / (rowHeight + margin[1]));

  // Capping
  x = clamp(x, 0, cols - w);
  y = clamp(y, 0, nbRows - h);
  return { x, y };
}

/**
 * Given a height and width in pixel values, calculate grid units.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calcluations.
 * @param  {Number} height                  Height in pixels.
 * @param  {Number} width                   Width in pixels.
 * @param  {Number} x                       X coordinate in grid units.
 * @param  {Number} y                       Y coordinate in grid units.
 * @return {Object}                         w, h as grid units.
 */
export function calcWH(
  positionParams: PositionParams,
  width: number,
  height: number,
  x: number,
  y: number,
  handleOrientation: string
): { w: number, h: number } {
  const colWidth = (
          (positionParams.containerWidth - (positionParams.margin)[0] * (positionParams.cols - 1) - (positionParams.containerPadding)[0] * 2) / positionParams.cols
  );
  const rowHeight = (
          (positionParams.containerHeight - (positionParams.margin)[1] * (positionParams.nbRows - 1) - (positionParams.containerPadding)[1] * 2) / positionParams.nbRows
  );

  // width = colWidth * w - (margin * (w - 1))
  // ...
  // w = (width + margin) / (colWidth + margin)
  let w = Math.round((width + (positionParams.margin)[0]) / (colWidth + (positionParams.margin)[0]));
  let h = Math.round((height + (positionParams.margin)[1]) / (rowHeight + (positionParams.margin)[1]));

  // Capping
  if (handleOrientation === "west") {
    w = clamp(w, 0, positionParams.cols);
  } else {
    w = clamp(w, 0, positionParams.cols - x);
  }

  h = clamp(h, 0, positionParams.nbRows - y);
  return { w, h };
}

// Similar to _.clamp
export function clamp(
  num: number,
  lowerBound: number,
  upperBound: number
): number {
  return Math.max(Math.min(num, upperBound), lowerBound);
}
