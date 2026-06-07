from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Account


class AccountAdmin(UserAdmin):
    list_display  = ('email', 'first_name', 'last_name', 'username', 'is_active', 'is_admin', 'date_joined')
    list_display_links = ('email', 'first_name', 'last_name')
    readonly_fields = ('date_joined', 'last_login')
    ordering = ('-date_joined',)
    filter_horizontal = ()
    list_filter      = ('is_admin', 'is_active', 'is_staff')
    fieldsets        = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'username', 'phone_number')}),
        ('Permissions', {'fields': ('is_admin', 'is_staff', 'is_active', 'is_superadmin')}),
        ('Important Dates', {'fields': ('date_joined', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'username', 'email', 'phone_number', 'password1', 'password2'),
        }),
    )

admin.site.register(Account, AccountAdmin)
