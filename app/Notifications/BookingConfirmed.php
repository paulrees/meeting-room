<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class BookingConfirmed extends Notification
{
    use Queueable;

    protected $booking;
    protected $bookedDate;
    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($booking, $bookedDate)
    {
       $this->booking = $booking;
       $this->bookedDate = $bookedDate;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Your meeting room booking is confirmed.')
                    ->success()
                    ->line('You have succesfully booked the meeting room! Here are the details:')
                    ->line('Date: ' . $this->bookedDate)
                    ->line('Start time: ' . $this->booking->start_time)
                    ->line('End time: ' . $this->booking->end_time)
                    ->action('View Calendar', 'https://laravel.com')
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
