# Troubleshooting Guide

## Fixed Issues

### ✅ "hexEngine is not defined" Error

**Problem:** Trying to use `hexEngine` in console returns undefined.

**Solution:** Fixed! The engine is now properly exposed to the browser console using a getter.

**Usage:**
```javascript
// These now work:
hexEngine.inspectState()
hexEngine.getState()
hexEngine.exportState()
```

### ✅ Favicon 404 Error

**Problem:** Browser console shows 404 error for `/favicon.ico`

**Solution:** Added `/public/favicon.svg` with a hex icon.

### ✅ WebGL Warnings

**Problem:** Console shows WebGL warnings about invalid enum values and draw calls.

**Solution:** Fixed draw call tracking to use proper Pixi.js v8 methods instead of deprecated WebGL calls.

## Common Issues

### Engine Not Loading

**Symptoms:**
- Blank screen
- No debug overlay
- Console errors

**Checks:**
1. Open browser console (F12)
2. Look for initialization messages:
   - "Initializing Hex Game Engine..."
   - "HexEngine initialized successfully"
   - "Grid: 25x25 (625 hexes)"

**Solutions:**
- Refresh the page (Cmd/Ctrl + R)
- Hard refresh (Cmd/Ctrl + Shift + R)
- Check console for error messages

### State Export Not Working

**Symptoms:**
- Pressing 'E' does nothing
- Export button doesn't download file

**Checks:**
```javascript
// Test if engine is ready
console.log(hexEngine);

// Test state capture
const state = hexEngine.getState();
console.log(state);
```

**Solutions:**
- Check if browser is blocking downloads
- Try using console: `hexEngine.exportState()`
- Use state test page: http://localhost:5173/tests/state-test.html

### Performance Issues

**Symptoms:**
- FPS below 60
- Lag when panning/zooming
- Red FPS counter

**Checks:**
```javascript
// Get performance report
hexEngine.getPerformanceReport();
```

**Solutions:**
1. **Check grid size:**
   - Default is 25x25 = 625 hexes
   - Reduce if needed in `src/main.js`

2. **Check browser:**
   - WebGL enabled?
   - Hardware acceleration on?
   - Other tabs consuming resources?

3. **Check debug overlay:**
   - Look at frame time (should be <16.67ms for 60fps)
   - Check memory usage

### Pan/Zoom Not Working

**Symptoms:**
- Can't drag viewport
- Scroll doesn't zoom

**Checks:**
1. Click on the canvas area (not buttons)
2. Try keyboard: Press 'R' to reset viewport

**Solutions:**
- Make sure canvas has focus (click on it)
- Check browser console for errors
- Try refreshing the page

### Console Commands Not Working

**Problem:** `hexEngine.inspectState()` shows error

**Check:**
```javascript
// Verify engine exists
console.log(typeof hexEngine);  // Should be "object"

// Check if initialized
console.log(hexEngine.isRunning);  // Should be true
```

**Solutions:**
- Wait for page to fully load
- Check for errors in console
- Refresh page

## Browser Compatibility

### Tested Browsers
- ✅ Chrome/Edge (v100+)
- ✅ Firefox (v100+)
- ✅ Safari (v15+)

### Known Issues

**Firefox:**
- Some WebGL warnings are normal (doesn't affect functionality)
- Performance slightly lower than Chrome

**Safari:**
- May need "Enable WebGL" in Develop menu
- Touch gestures work best on actual iOS devices

**Mobile:**
- Pinch-to-zoom works on touch devices
- Performance may vary on older devices

## Development Server Issues

### Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill existing process
lsof -ti:5173 | xargs kill

# Or use different port
npm run dev -- --port 3000
```

### Hot Reload Not Working

**Symptoms:**
- Changes to code don't reflect
- Need manual refresh

**Solutions:**
1. Check Vite console for errors
2. Restart dev server: Ctrl+C, then `npm run dev`
3. Clear browser cache

### Module Import Errors

**Error:** `Failed to resolve module`

**Solutions:**
1. Check file paths (case-sensitive!)
2. Restart dev server
3. Clear node_modules: `rm -rf node_modules && npm install`

## Debug Commands

### Quick Health Check
```javascript
// Run all checks
console.log('Engine exists:', typeof hexEngine !== 'undefined');
console.log('Engine running:', hexEngine?.isRunning);
console.log('FPS:', hexEngine?.debugOverlay?.getFPS());
console.log('Hex count:', hexEngine?.hexGrid?.getHexCount());

// Get full report
hexEngine.inspectState();
```

### Performance Check
```javascript
// Measure current performance
const report = hexEngine.getPerformanceReport();
console.table({
  'FPS': report.fps,
  'Avg Frame Time (ms)': report.avgFrameTime.toFixed(2),
  'Update Time (ms)': report.updateTime.toFixed(2),
  'Frame Count': report.frameCount
});
```

### State Validation
```javascript
// Capture and validate state
const state = hexEngine.getState();

console.log('✓ Version:', state.version);
console.log('✓ Checksum:', state.checksum);
console.log('✓ Hexes:', state.grid.hexes.length);
console.log('✓ Timestamp:', new Date(state.timestamp).toLocaleString());

// Validate integrity
const json = JSON.stringify(state);
const reloaded = JSON.parse(json);
console.log('✓ Round-trip successful:', reloaded.checksum === state.checksum);
```

## Getting Help

### Information to Include

When reporting issues, include:

1. **Browser & Version:**
   ```javascript
   console.log(navigator.userAgent);
   ```

2. **Engine State:**
   ```javascript
   hexEngine.inspectState();
   ```

3. **Performance Report:**
   ```javascript
   hexEngine.getPerformanceReport();
   ```

4. **Console Errors:**
   - Copy full error messages
   - Include stack traces

### Useful Links

- Main App: http://localhost:5173/
- State Test: http://localhost:5173/tests/state-test.html
- Performance Test: http://localhost:5173/tests/performance/hex-render-test.html

## Reset Everything

If all else fails:

```bash
# Stop dev server (Ctrl+C)

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

Then refresh browser with hard reload (Cmd/Ctrl + Shift + R).

---

**Still having issues?** Check the browser console first - it will show the exact error!
