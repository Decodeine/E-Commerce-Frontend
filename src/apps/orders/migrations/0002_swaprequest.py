from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SwapRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_device', models.JSONField(default=dict)),
                ('estimated_value', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('target_device_id', models.CharField(max_length=120)),
                ('target_device_price', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('difference', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='swap_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-created_at',),
            },
        ),
        migrations.AddIndex(
            model_name='swaprequest',
            index=models.Index(fields=['user', 'status'], name='orders_swap_user_id_status_idx'),
        ),
        migrations.AddIndex(
            model_name='swaprequest',
            index=models.Index(fields=['created_at'], name='orders_swap_created_idx'),
        ),
    ]

