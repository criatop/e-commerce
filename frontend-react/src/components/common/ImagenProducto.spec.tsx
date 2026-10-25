import { fireEvent, render, screen } from "@testing-library/react";
import ImagenProducto from "./ImagenProducto";
import { describe, expect, it } from "vitest";

describe("ImagenProducto", () => {
  it("antepone /img/ cuando la imagen es relativa", () => {
    render(<ImagenProducto imagen="collar.png" alt="Collar" />);
    const img = screen.getByAltText("Collar");
    expect(img.getAttribute("src")).toBe("/img/collar.png");
  });

  it("respeta las rutas absolutas", () => {
    render(<ImagenProducto imagen="/uploads/collar.png" alt="Collar" />);
    expect(screen.getByAltText("Collar").getAttribute("src")).toBe(
      "/uploads/collar.png",
    );
  });

  it("aplica las clases y estilos recibidos", () => {
    render(
      <ImagenProducto
        imagen="collar.png"
        alt="Collar"
        className="mw-100"
        style={{ width: 100 }}
      />,
    );
    const img = screen.getByAltText("Collar");
    expect(img.className).toBe("mw-100");
    expect(img.style.width).toBe("100px");
  });

  it("usa el placeholder cuando la imagen falla al cargar", () => {
    render(<ImagenProducto imagen="no-existe.png" alt="Collar" />);
    const img = screen.getByAltText("Collar");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toContain("data:image/svg+xml");
  });
});
