
import math

def generate_spiral_path(turns=2.5, points_per_turn=50, a=1, b=0.3063):
    """
    Generates an SVG path for a logarithmic spiral.
    x = a * exp(b * theta) * cos(theta)
    y = a * exp(b * theta) * sin(theta)
    b = 0.3063 gives a golden spiral (growth factor phi per quarter turn approx).
    """
    path_data = []
    
    # We want the spiral to fit in a 100x100 box approx.
    # Let's calculate points first then normalize.
    points = []
    max_theta = turns * 2 * math.pi
    
    # We generate from inside out or outside in?
    # Let's go from inside out (theta = 0 to max)
    # But usually volutes look better starting large and spiraling in.
    # Let's generate points and see limits.
    
    start_theta = 0
    end_theta = max_theta
    step = (end_theta - start_theta) / (turns * points_per_turn)
    
    theta = end_theta
    while theta >= start_theta:
        r = a * math.exp(b * theta)
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        points.append((x, y))
        theta -= step
        
    # Normalize points to fit in 0-100 box
    min_x = min(p[0] for p in points)
    max_x = max(p[0] for p in points)
    min_y = min(p[1] for p in points)
    max_y = max(p[1] for p in points)
    
    width = max_x - min_x
    height = max_y - min_y
    scale = 90 / max(width, height) # Leave some padding
    
    # Center it
    dx = (100 - width * scale) / 2 - min_x * scale
    dy = (100 - height * scale) / 2 - min_y * scale
    
    svg_points = []
    for x, y in points:
        nx = x * scale + dx
        ny = y * scale + dy
        svg_points.append((nx, ny))
        
    # Create Path Data (Lines for simplicity, smooth enough)
    if not svg_points:
        return ""
        
    start = svg_points[0]
    d = f"M {start[0]:.2f} {start[1]:.2f}"
    
    for p in svg_points[1:]:
        d += f" L {p[0]:.2f} {p[1]:.2f}"
        
    return d

path_d = generate_spiral_path(turns=2.2, b=0.2) # Adjusted b for a tighter/looser spiral
print(f'<path d="{path_d}" stroke="#3e2723" stroke-width="4" fill="none" stroke-linecap="round" />')
