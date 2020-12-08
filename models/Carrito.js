module.exports = function Carrito(viejoCarrito) {
  this.items = viejoCarrito.items || {};
  this.cantidadTotal = viejoCarrito.cantidadTotal || 0;
  this.precioTotal = viejoCarrito.precioTotal || 0;

  this.add = function(item, id){
      var itemAlmacenado = this.items[id];
      if (!itemAlmacenado) {
          itemAlmacenado = this.items[id] = {item: item, qty: 0, precio: 0};
      }
      itemAlmacenado.qty++;
      itemAlmacenado.precio = itemAlmacenado.item.precio * itemAlmacenado.qty;
      this.cantidadTotal++;
      this.precioTotal += itemAlmacenado.item.precio;
  };

  this.generarArray = function() {
      var arr = [];
      for (var id in this.items){
          arr.push(this.items[id]);
      }
      return arr;
  };
  this.eliminarItems = (id) => {
      this.cantidadTotal -= this.items[id].qty;
      this.precioTotal -= this.items[id].precio;
      delete this.items[id];
  }

  this.reducirItem = (id) => {
      this.items[id].qty--;
      this.items[id].precio -= this.items[id].item.precio;
      this.cantidadTotal--;
      this.precioTotal -= this.items[id].item.precio;

      if (this.items[id].qty <= 0) {
          delete this.items[id];
      }
  }
};