from django.urls import path
from . import views

urlpatterns = [
    path('cart/',                    views.CartView.as_view(),        name='cart'),
    path('cart/<int:item_id>/',      views.CartItemView.as_view(),    name='cart-item'),
    path('checkout/',                views.CheckoutView.as_view(),    name='checkout'),
    path('',                         views.OrderListView.as_view(),   name='order-list'),
    path('<str:order_number>/',      views.OrderDetailView.as_view(), name='order-detail'),
]
