<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UserFeatureTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
     
    /** @test */     
    public function user_sees_a_home_page()
    {
        $this->visit('/')
             ->see('Mettrr');
    }
}




